import requests
import lxml.html as html
import json
import sys
import pycountry

#cd C:\Users\patri\Desktop\VALORANTLE_2\emea && py -m http.server 80
#cd C:\Users\patri\Desktop\VALORANTLE_2/ && ngrok http 80

teams_eu = [
    ("https://vlr.gg/team/7035/koi", 'ES'),
    ("https://www.vlr.gg/team/2059/team-vitality", "FR"),
    ("https://www.vlr.gg/team/474/team-liquid", 'NL'),
    ("https://www.vlr.gg/team/397/bbl-esports", "TR"),
    ("https://www.vlr.gg/team/2593/fnatic", "UK"),
    ("https://www.vlr.gg/team/1184/fut-esports", "TR"),
    ("https://www.vlr.gg/team/2304/giants-gaming", "ES"),
    ("https://www.vlr.gg/team/8877/karmine-corp", "FR"),
    ("https://www.vlr.gg/team/4915/natus-vincere", "UA"),
    ("https://www.vlr.gg/team/1001/team-heretics", "ES"),
    ('https://www.vlr.gg/team/12694/gentle-mates', 'FR'),
]

teams_na = [
    ("https://www.vlr.gg/team/120/100-thieves", "NA"),
    ("https://www.vlr.gg/team/188/cloud9", "NA"),
    ("https://www.vlr.gg/team/5248/evil-geniuses", "NA"),
    ("https://www.vlr.gg/team/2406/furia", "BR"),
    ("https://www.vlr.gg/team/2355/kr-esports", "LATAM"),
    ("https://www.vlr.gg/team/2359/leviat-n", "LATAM"),
    ("https://www.vlr.gg/team/6961/loud", "BR"),
    ("https://www.vlr.gg/team/7386/mibr", "BR"),
    ("https://www.vlr.gg/team/1034/nrg-esports", "NA"),
    ("https://www.vlr.gg/team/2/sentinels", 'NA'),
        ('https://www.vlr.gg/team/11058/g2-esports', 'DE')

]

teams_apac = [
    ("https://www.vlr.gg/team/918/global-esports", 'IN'),
    ("https://www.vlr.gg/team/278/detonation-focusme", "JP"),
    ("https://www.vlr.gg/team/8185/drx", "KR"),
    ("https://www.vlr.gg/team/17/gen-g", "KR"),
    ("https://www.vlr.gg/team/878/rex-regum-qeon", "ID"),
    ("https://www.vlr.gg/team/14/t1", "KR"),
    ("https://www.vlr.gg/team/8304/talon-esports", "TH"),
    ("https://www.vlr.gg/team/6199/team-secret", "PH"),
    ("https://www.vlr.gg/team/624/paper-rex", "SG"),
    ("https://www.vlr.gg/team/5448/zeta-division", "JP"),
    ('https://www.vlr.gg/team/6387/bleed', 'SG')
]


teams_china = [
    ('https://www.vlr.gg/team/11981/dragon-ranger-gaming', 'CN'),
    ('https://www.vlr.gg/team/13790/wolves-esports', 'CN'),
    ('https://www.vlr.gg/team/731/tyloo', 'CN'),
    ('https://www.vlr.gg/team/14137/titan-esports-club', 'CN'),
    ('https://www.vlr.gg/team/12685/trace-esports', 'CN'),
    ('https://www.vlr.gg/team/12064/nova-esports', 'CN'),
    ('https://www.vlr.gg/team/13576/jd-gaming', 'CN'),
    ('https://www.vlr.gg/team/11328/funplus-phoenix', 'CN'),
    ('https://www.vlr.gg/team/1120/edward-gaming', 'CN'),
    ('https://www.vlr.gg/team/12010/bilibili-gaming', 'CN'),
    ('https://www.vlr.gg/team/1119/all-gamers', 'CN')    
]
igls = open('igls.txt', 'r').read().splitlines()

data = {}

def get_page(url):
    return html.fromstring(requests.get(url).text)


def parse_player(obj, player_data):
    player_data['name'] = obj.xpath("//h1[@class='wf-title']")[0].text_content().replace('\n\t\t\t \t\t', '').replace('\t\t\t \t', '')
    player_data['igl']= player_data['name'].lower() in igls
    player_data['country'] = obj.xpath("//div[@class='player-header']/div/div[@class='ge-text-light']")[0] \
        .text_content() \
        .strip() \
        .title()
    if player_data['country'] == 'International':
        player_data['code'] = 'UN'
    elif player_data['country'] == 'Turkey':
        player_data['code'] = 'TR'
    else:
        player_data['code'] = pycountry.countries.search_fuzzy(player_data['country'])[0].alpha_2
    agents = obj.xpath('//tbody/tr')
    player_data['agents'] = []
    for i in range(0, 3):
        try:
            player_data['agents'].append(
                agents[i].xpath('./td/img')[0] \
                    .attrib['alt'] \
                    .capitalize()
            )
        except:
           player_data['agents'].append('')
    return player_data

if sys.argv[1] == 'na':
    teams = teams_na
elif sys.argv[1] == 'eu':
    teams = teams_eu
elif sys.argv[1] == 'china':
    teams = teams_china
elif sys.argv[1] == 'apac':
    teams = teams_apac

for team in teams:
    page = get_page(team[0])
    team_name = page.xpath('//title')[0] \
        .text_content() \
        .strip() \
        .split(':')[0]

    try:
        team_tag = page.xpath("//h2[@class='wf-title team-header-tag']")[0].text_content()
    except:
        team_tag = team_name
    print(team_tag)
    last_match = page.xpath("//div[@class='team-summary-container-1']/div[@style='margin-bottom: 20px;']/div/a[@class='wf-card fc-flex m-item']")
    last_match_url = list(last_match[0].iterlinks())[0][2]
    
    last_match_page = get_page(f'https://vlr.gg{last_match_url}')
    player_tables = last_match_page.xpath("//table[@class='wf-table-inset mod-overview']")

    table_one = player_tables[3]
    table_two = player_tables[2]

    players = []
    if f'\t{team_tag}\t' in table_one.text_content():
        for i in table_one.iterlinks():
            if not i[2].endswith('.png'):
                players.append('https://vlr.gg' + i[2])
    else:
        for i in table_two.iterlinks():
            if not i[2].endswith('.png'):
                players.append('https://vlr.gg' + i[2])
    print(players)
    print(f'\t{team_tag}\t' in table_one.text_content())
    print(list(player_tables[3].iterlinks()), '\n\n', list(player_tables[2].iterlinks()))

    print(team_tag)
    for player in players:
        player_data = {}
        player_data['team'] = team_name
        player_data = parse_player(
            get_page(
                player+ '?timespan=60d'
            ),
            player_data
        )
        if player_data['agents'] == ['', '', '']:
            player_data = parse_player(
                get_page(
                    player +  '?timespan=all'
                ),
                player_data
            )
        data[player_data['name'].lower()] = [
            player_data['name'], player_data['country'], player_data['code'], sys.argv[1].upper(), 
            player_data['team'], team[1] , player_data['agents'], player_data['igl']
        ]
        print(player_data)


with open('player_data.json','w') as output:
    json.dump(data, output)
