execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] remove voltage_0
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @s remove voltage_0
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] remove voltage_1
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @s remove voltage_1
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] add voltage_2
execute as @e[type=tcmb:tcmb_car,c=1] at @s if entity @s[tag=!only_vol1] run tag @s add voltage_2
execute as @e[type=tcmb:tcmb_car,c=1] at @s if entity @s[tag=only_vol1] run tag @s add voltage_2