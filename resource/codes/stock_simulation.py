import numpy as np
import matplotlib.pyplot as plt
import time
from matplotlib.ticker import FuncFormatter

num_people = 1000
initial_capital = 1000
num_rounds = 100
win_probability = 0.55
profit_rate = 0.30
loss_rate = 0.30

expected_multiplier = win_probability * (1 + profit_rate) + (1 - win_probability) * (1 - loss_rate)
print(f"Expected multiplier per round: {expected_multiplier:.4f}")
print(f"Theoretical expected capital after 100 rounds: {initial_capital * (expected_multiplier ** num_rounds):.2f} coins")
print(f"Multiplier compared to initial capital: {(expected_multiplier ** num_rounds):.2f}x")
print()

capital_history = [[initial_capital] * (num_rounds + 1) for _ in range(num_people)]
timestamp = int(time.time())
print(timestamp)
np.random.seed(timestamp)
for round_num in range(num_rounds):
    trade_results = np.random.random(num_people) < win_probability
    
    for i in range(num_people):
        capital_history[i][round_num + 1] = capital_history[i][round_num] * (1 + profit_rate if trade_results[i] else 1 - loss_rate)

capital_history = np.around(capital_history).astype(int)
capital_history_array = np.array(capital_history)
final_capital = capital_history_array[:, -1]
avg_final_capital = np.mean(final_capital)
median_final_capital = np.median(final_capital)
max_final_capital = np.max(final_capital)
min_final_capital = np.min(final_capital)
std_final_capital = np.std(final_capital)

print("=" * 50)
print("Simulation Results Statistics (After 100 Rounds)")
print("=" * 50)
print(f"Average capital: {avg_final_capital:.2f} coins (Multiplier compared to initial: {avg_final_capital/initial_capital:.2f}x)")
print(f"Median capital: {median_final_capital:.2f} coins (Multiplier compared to initial: {median_final_capital/initial_capital:.2f}x)")
print(f"Maximum capital: {max_final_capital:.2f} coins (Multiplier compared to initial: {max_final_capital/initial_capital:.2f}x)")
print(f"Minimum capital: {min_final_capital:.2f} coins (Multiplier compared to initial: {min_final_capital/initial_capital:.2f}x)")
print(f"Standard deviation: {std_final_capital:.2f} coins")
print()

bankrupt_count = np.sum(final_capital <= 0)
print(f"Bankrupt: {bankrupt_count} people ({bankrupt_count/num_people*100:.1f}%)")
print(f"Profitable: {np.sum(final_capital > initial_capital)} people ({np.sum(final_capital > initial_capital)/num_people*100:.1f}%)")
print()

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
fig.suptitle('Stock Trading Simulation Results (1000 people, 100 rounds)', fontsize=16, fontweight='bold')

ax1 = axes[0]
np.random.seed(timestamp)
colors = np.random.rand(num_people, 3)
for i in range(num_people):
    ax1.plot(capital_history_array[i, :], alpha=1, color=colors[i], linewidth=0.8)
ax1.axhline(y=initial_capital, color='red', linewidth=2, linestyle='--', label=f'Initial Capital ({initial_capital})')
ax1.set_xlabel('Trading Round')
ax1.set_ylabel('Capital (coins)')
ax1.set_title('Capital Changes Per Round for All Participants')
ax1.legend()
ax1.grid(True, alpha=0.3)

ax1.set_ylim(bottom=0)
ax1.set_yscale('symlog', linthresh=1)
ax1.set_yticks([0, 1, 10, 100, 1000, 10000, 100000, 1000000])
ax1.yaxis.set_major_formatter(FuncFormatter(lambda x, p: f'{int(x)}'))

ax2 = axes[1]
return_earnings = final_capital - initial_capital
print(return_earnings / 1000)
intervals = [(-float('inf'), -1), (-1, 0), (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9), (9, 10), (10, float('inf'))]
labels = ['-1k', '0k', '1k', '2k', '3k', '4k', '5k', '6k', '7k', '8k', '9k', '10k', 'more']

counts = []

for interval_start, interval_end in intervals:
    count = np.sum((return_earnings / 1000 > interval_start) & (return_earnings / 1000 <= interval_end))
    counts.append(count)

values = counts

colors_bar = ['darkred' if ((interval_end + interval_start) / 2) < -0.5 else \
              'red' if ((interval_end + interval_start) / 2) < 0 else \
              'yellow' if ((interval_end + interval_start) / 2) < 2 else \
              'lightgreen' if ((interval_end + interval_start) / 2) < 10 else 'green'
             for interval_start, interval_end in intervals]

bars = ax2.bar(labels, values, color=colors_bar, edgecolor='black', alpha=0.7)

ax2.set_xlabel('Return Rate Interval')
ax2.set_ylabel('Number of People')
ax2.set_title('Distribution of People by Return Rate Interval')
ax2.grid(True, alpha=0.3, axis='y')

ax2.set_xticks([i - 0.5 for i in range(1, len(labels) + 1)])
ax2.set_xticklabels(labels, rotation=0, ha='center')

for bar, val in zip(bars, values):
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height,
            f'{int(val)}', ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.savefig('stock_simulation.png', dpi=150, bbox_inches='tight')
print("Chart saved as 'stock_simulation.png'")

avg_profit_per_round = np.mean(capital_history_array - initial_capital, axis=0)
rounds = np.arange(num_rounds + 1)
fig2, ax2p = plt.subplots(figsize=(10, 6))
ax2p.plot(rounds, avg_profit_per_round, marker='o', linestyle='-', color='tab:blue')
ax2p.set_xlabel('Round')
ax2p.set_ylabel('Average Profit per Person (coins)')
ax2p.set_title('Average Profit per Person vs Round Number')
ax2p.grid(True, alpha=0.3)
fig2.tight_layout()
fig2.savefig('avg_profit_per_round.png', dpi=150, bbox_inches='tight')
print("Chart saved as 'avg_profit_per_round.png'")

shuffled_final = final_capital.copy()
rng = np.random.RandomState(timestamp)
rng.shuffle(shuffled_final)
cumsum = np.cumsum(shuffled_final)
counts_arr = np.arange(1, num_people + 1)
avg_profit_by_players = cumsum / counts_arr - initial_capital
fig3, ax3 = plt.subplots(figsize=(10, 6))
ax3.plot(counts_arr, avg_profit_by_players, color='tab:orange', linewidth=1)
ax3.set_xlabel('Number of Players')
ax3.set_ylabel('Average Profit per Person (coins)')
ax3.set_title('Average Profit per Person vs Number of Players')
ax3.grid(True, alpha=0.3)
fig3.tight_layout()
fig3.savefig('avg_profit_vs_players.png', dpi=150, bbox_inches='tight')
print("Chart saved as 'avg_profit_vs_players.png'")

plt.show()
