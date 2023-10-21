#削除処理
execute as @e[tag=body,r=2] at @s run scriptevent tcmb:delete
ride @e[tag=body,r=2] stop_riding
event entity @e[type=tcmb:tcmb_car,r=2] delete
tp @e[tag=body,r=2] ~ -128 ~