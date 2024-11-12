require "rubygems"
require 'rake'
require 'yaml'
require 'time'

SOURCE = "."
CONFIG = {
  'version' => "12.3.2",
  'themes' => File.join(SOURCE, "_includes", "themes"),
  'layouts' => File.join(SOURCE, "_layouts"),
  'posts' => File.join(SOURCE, "_posts"),
  'academic' => File.join(SOURCE, "_academic"),
  'post_ext' => "md",
  'theme_package_version' => "0.1.0"
}

# # Usage: rake post title="A Title" subtitle="A sub title"
# desc "Begin a new post in #{CONFIG['posts']}"
# task :post do
  # abort("rake aborted: '#{CONFIG['posts']}' directory not found.") unless FileTest.directory?(CONFIG['posts'])
  # title = ENV["title"] || "new-post"
  # subtitle = ENV["subtitle"] || "This is a subtitle"
  # slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
  # begin
    # date = (ENV['date'] ? Time.parse(ENV['date']) : Time.now).strftime('%Y-%m-%d')
  # rescue Exception => e
    # puts "Error - date format must be YYYY-MM-DD, please check you typed it correctly!"
    # exit -1
  # end
  # filename = File.join(CONFIG['posts'], "#{date}-#{slug}.#{CONFIG['post_ext']}")
  # if File.exist?(filename)
    # abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  # end

  # puts "Creating new post: #{filename}"
  # open(filename, 'w') do |post|
    # post.puts "---"
    # post.puts "layout: post"
    # post.puts "title: \"#{title.gsub(/-/,' ')}\""
    # post.puts "subtitle: \"#{subtitle.gsub(/-/,' ')}\""
    # post.puts "date: #{date}"
    # post.puts "author: \"Hux\""
    # post.puts "header-img: \"img/post-bg-2015.jpg\""
    # post.puts "tags: []"
    # post.puts "---"
  # end
# end # task :post


# # Usage: rake post title="A Title" subtitle="A sub title"
# desc "Begin a new academic in #{CONFIG['academic']}"
# task :academic do
  # abort("rake aborted: '#{CONFIG['academic']}' directory not found.") unless FileTest.directory?(CONFIG['academic'])
  # title = ENV["title"] || "new-academic"
  # subtitle = ENV["subtitle"] || "This is a subtitle"
  # slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
  # begin
    # date = (ENV['date'] ? Time.parse(ENV['date']) : Time.now).strftime('%Y-%m-%d')
  # rescue Exception => e
    # puts "Error - date format must be YYYY-MM-DD, please check you typed it correctly!"
    # exit -1
  # end
  # filename = File.join(CONFIG['academic'], "#{date}-#{slug}.#{CONFIG['post_ext']}")
  # if File.exist?(filename)
    # abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  # end

  # puts "Creating new academic: #{filename}"
  # open(filename, 'w') do |academic|
    # academic.puts "---"
    # academic.puts "layout: academic"
    # academic.puts "title: \"#{title.gsub(/-/,' ')}\""
    # academic.puts "subtitle: \"#{subtitle.gsub(/-/,' ')}\""
    # academic.puts "date: #{date}"
    # academic.puts "author: \"Hux\""
    # academic.puts "header-img: \"img/post-bg-2015.jpg\""
    # academic.puts "tags: []"
    # academic.puts "---"
  # end
# end # task :academic

def create_post(type)
  directory = CONFIG[type]
  abort("rake aborted: '#{directory}' directory not found.") unless FileTest.directory?(directory)
  
  title = ENV["title"] || "new-post"
  subtitle = ENV["subtitle"] || "This is a subtitle"
  slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
  date = (ENV['date'] ? Time.parse(ENV['date']) : Time.now).strftime('%Y-%m-%d')
  
  filename = File.join(directory, "#{date}-#{slug}.#{CONFIG['post_ext']}")
  if File.exist?(filename)
    puts "#{filename} already exists. Do you want to overwrite? (y/n)"
    overwrite = STDIN.gets.chomp
    abort("rake aborted!") if overwrite == 'n'
  end

  puts "Creating new post: #{filename}"
  layout = type == 'posts' ? 'post' : 'academic'
  File.open(filename, 'w') do |file|
    file.puts "---"
    file.puts "layout: #{layout}"
    file.puts "title: \"#{title.gsub(/-/,' ')}\""
    file.puts "subtitle: \"#{subtitle.gsub(/-/,' ')}\""
    file.puts "date: #{date}"
    file.puts "author: \"Hux\""
    file.puts "header-img: \"img/post-bg-2015.jpg\""
    file.puts "tags: []"
    file.puts "---"
  end
end

desc "Begin a new post in #{CONFIG['posts']}"
task :post do
  create_post('posts')
end

desc "Begin a new academic post in #{CONFIG['academic']}"
task :academic do
  create_post('academic')
end


desc "Launch preview environment"
task :preview do
  system "jekyll --auto --server"
end # task :preview

#Load custom rake scripts
Dir['_rake/*.rake'].each { |r| load r }
