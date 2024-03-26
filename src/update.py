import sys
import random
import json


config = json.load(open(f'./{sys.argv[1]}/player_data.json', 'r'))
last_10_players = open(f'./{sys.argv[1]}/last_players.txt').read().splitlines()

config['day'] += 1
config['next_game'] += 86400
    
temp_players = [player for player in list(config['players'].items()) if player not in last_10_players]
config['answer'], _ = random.choice(temp_players)

if len(last_10_players) >= 10:
    last_10_players.pop(-1)

last_10_players.insert(0, config['answer'])

with open(f'./{sys.argv[1]}/player_data.json', 'w') as output:
    json.dump(config, output)

with open(f'./{sys.argv[1]}/last_players.txt', 'w') as output:
    for player in last_10_players:
        output.write(player + '\n')
