---
layout:       post
title:        "C++内存管之Loki::allocator"
author:       "kalos Aner"
header-style: text
catalog:      true
tags:
    - C++
    - 内存管理

---

### 1、基本结构

![Snipaste_2024-11-23_20-51-26](\img\in-post\Snipaste_2024-11-23_20-51-26.png)

Loki::allocator 的每一个 Chunk 使用数组代替指针，pData_ 是一个unsigned char 类型的指针，指向一个数组。这个数组每一个位置都记录下一个可用空间的索引。firstAvailableBlock_ 记录下一个可用位置的索引，blocksAvailable_ 记录剩余可用的位置数量。

![Snipaste_2024-11-23_20-42-59](\img\in-post\Snipaste_2024-11-23_20-42-59.png)

分配时通过 firstAvailableBlock_ 找到下一个可用位置，分配出去，并设置 firstAvailableBlock_ 为该位置原本存储的索引。

![Snipaste_2024-11-23_20-46-03](\img\in-post\Snipaste_2024-11-23_20-46-03.png)

回收时先找到需要回收的指针的位置，使该位置指向 firstAvailableBlock_ 存储的索引，然后令 firstAvailableBlock_ 等于该位置的索引。

### 2、源码剖析

```cpp
void * FixedAllocator::Allocate( void )
{
    // prove either emptyChunk_ points nowhere, or points to a truly empty Chunk.
    assert( ( NULL == emptyChunk_ ) || ( emptyChunk_->HasAvailable( numBlocks_ ) ) );
    assert( CountEmptyChunks() < 2 );
	// 如果这一次是第一次分配或者上一次分配的 chunk 已经被全分配出去
    if ( ( NULL == allocChunk_ ) || allocChunk_->IsFilled() )
    {
        if ( NULL != emptyChunk_ )
        {
            allocChunk_ = emptyChunk_;
            emptyChunk_ = NULL;
        }
        else
        {	// 循环查找空 chunk
            for ( ChunkIter i( chunks_.begin() ); ; ++i )
            {	// 到达尾端没找到空 chunk，则创建新的 chunk
                if ( chunks_.end() == i )
                {
                    if ( !MakeNewChunk() )
                        return NULL;
                    break;
                }
                // 如果找到空 chunk，则标记并 break
                if ( !i->IsFilled() )
                {
                    allocChunk_ = &*i;
                    break;
                }
            }
        }
    }
    else if ( allocChunk_ == emptyChunk_)
        // detach emptyChunk_ from allocChunk_, because after 
        // calling allocChunk_->Allocate(blockSize_); the chunk 
        // is no longer empty.
        emptyChunk_ = NULL;

    assert( allocChunk_ != NULL );
    assert( !allocChunk_->IsFilled() );
    void * place = allocChunk_->Allocate( blockSize_ );

    // prove either emptyChunk_ points nowhere, or points to a truly empty Chunk.
    assert( ( NULL == emptyChunk_ ) || ( emptyChunk_->HasAvailable( numBlocks_ ) ) );
    assert( CountEmptyChunks() < 2 );
#ifdef LOKI_CHECK_FOR_CORRUPTION
    if ( allocChunk_->IsCorrupt( numBlocks_, blockSize_, true ) )
    {
        assert( false );
        return NULL;
    }
#endif

    return place;
}
bool FixedAllocator::MakeNewChunk( void )
{
    bool allocated = false;
    try
    {
        std::size_t size = chunks_.size();
        // Calling chunks_.reserve *before* creating and initializing the new
        // Chunk means that nothing is leaked by this function in case an
        // exception is thrown from reserve.
        if ( chunks_.capacity() == size )
        {
            if ( 0 == size ) size = 4;
            chunks_.reserve( size * 2 );
        }
        Chunk newChunk;
        allocated = newChunk.Init( blockSize_, numBlocks_ );
        if ( allocated )
            chunks_.push_back( newChunk );
    }
    catch ( ... )
    {
        allocated = false;
    }
    if ( !allocated ) return false;
	// 指向新的 chunk
    allocChunk_ = &chunks_.back();
    // 如果 chunks_.push_back 发生 move 的话，deallocChunk_ 重新设置
    deallocChunk_ = &chunks_.front();
    return true;
}
```

```cpp
bool FixedAllocator::Deallocate( void * p, Chunk * hint )
{
    assert(!chunks_.empty());
    assert(&chunks_.front() <= deallocChunk_);
    assert(&chunks_.back() >= deallocChunk_);
    assert( &chunks_.front() <= allocChunk_ );
    assert( &chunks_.back() >= allocChunk_ );
    assert( CountEmptyChunks() < 2 );

    Chunk * foundChunk = ( NULL == hint ) ? VicinityFind( p ) : hint;
    if ( NULL == foundChunk )
        return false;

    assert( foundChunk->HasBlock( p, numBlocks_ * blockSize_ ) );
#ifdef LOKI_CHECK_FOR_CORRUPTION
    if ( foundChunk->IsCorrupt( numBlocks_, blockSize_, true ) )
    {
        assert( false );
        return false;
    }
    if ( foundChunk->IsBlockAvailable( p, numBlocks_, blockSize_ ) )
    {
        assert( false );
        return false;
    }
#endif
    deallocChunk_ = foundChunk;
    DoDeallocate(p);
    assert( CountEmptyChunks() < 2 );

    return true;
}

// FixedAllocator::VicinityFind -----------------------------------------------

Chunk * FixedAllocator::VicinityFind( void * p ) const
{
    if ( chunks_.empty() ) return NULL;
    assert(deallocChunk_);

    const std::size_t chunkLength = numBlocks_ * blockSize_;
    Chunk * lo = deallocChunk_;
    Chunk * hi = deallocChunk_ + 1;
    const Chunk * loBound = &chunks_.front();
    const Chunk * hiBound = &chunks_.back() + 1;

    // Special case: deallocChunk_ is the last in the array
    if (hi == hiBound) hi = NULL;
	// 1、旧版此处有 bug，如果检索不到 p 则会死循环，本版是新版已修复
    for (;;)
    {
        if (lo)
        {
            if ( lo->HasBlock( p, chunkLength ) ) return lo;
            if ( lo == loBound )
            {
                lo = NULL;
                if ( NULL == hi ) break;
            }
            else --lo;
        }

        if (hi)
        {
            if ( hi->HasBlock( p, chunkLength ) ) return hi;
            if ( ++hi == hiBound )
            {
                hi = NULL;
                if ( NULL == lo ) break;
            }
        }
    }

    return NULL;
}

// FixedAllocator::DoDeallocate -----------------------------------------------

void FixedAllocator::DoDeallocate(void* p)
{
    // Show that deallocChunk_ really owns the block at address p.
    assert( deallocChunk_->HasBlock( p, numBlocks_ * blockSize_ ) );
    // Either of the next two assertions may fail if somebody tries to
    // delete the same block twice.
    assert( emptyChunk_ != deallocChunk_ );
    assert( !deallocChunk_->HasAvailable( numBlocks_ ) );
    // prove either emptyChunk_ points nowhere, or points to a truly empty Chunk.
    assert( ( NULL == emptyChunk_ ) || ( emptyChunk_->HasAvailable( numBlocks_ ) ) );

    // call into the chunk, will adjust the inner list but won't release memory
    deallocChunk_->Deallocate(p, blockSize_);
	// 2、旧版此处有 bug，某些情况下会不归还 chunk 给系统，本版是新版已修复
    if ( deallocChunk_->HasAvailable( numBlocks_ ) )
    {
        assert( emptyChunk_ != deallocChunk_ );
        // deallocChunk_ is empty, but a Chunk is only released if there are 2
        // empty chunks.  Since emptyChunk_ may only point to a previously
        // cleared Chunk, if it points to something else besides deallocChunk_,
        // then FixedAllocator currently has 2 empty Chunks.
        if ( NULL != emptyChunk_ )
        {
            // If last Chunk is empty, just change what deallocChunk_
            // points to, and release the last.  Otherwise, swap an empty
            // Chunk with the last, and then release it.
            Chunk * lastChunk = &chunks_.back();
            if ( lastChunk == deallocChunk_ )
                deallocChunk_ = emptyChunk_;
            else if ( lastChunk != emptyChunk_ )
                std::swap( *emptyChunk_, *lastChunk );
            assert( lastChunk->HasAvailable( numBlocks_ ) );
            lastChunk->Release();
            chunks_.pop_back();
            if ( ( allocChunk_ == lastChunk ) || allocChunk_->IsFilled() ) 
                allocChunk_ = deallocChunk_;
        }
        emptyChunk_ = deallocChunk_;
    }

    // prove either emptyChunk_ points nowhere, or points to a truly empty Chunk.
    assert( ( NULL == emptyChunk_ ) || ( emptyChunk_->HasAvailable( numBlocks_ ) ) );
}
```

### 3、总结

Loki::allocator 分配器使用 vector 作为容器存储索引，而后又为 vector 提供分配服务。但其实 Loki::allocator 初始阶段使用的 vector 中的分配器还是 std的分配器，当其内存池初始化完成后才可以独立管理内存。所以这种一种不完全自举。
