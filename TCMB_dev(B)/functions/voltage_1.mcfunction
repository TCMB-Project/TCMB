execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] remove voltage_0
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @s remove voltage_0
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] remove voltage_2
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @s remove voltage_2
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] remove voltage_b 
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @s remove voltage_b
execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[tag=body,r=1] add voltage_1
execute as @e[type=tcmb:tcmb_car,c=1] if entity @s[tag=!only_vol2] at @s run tag @s add voltage_1
execute as @e[type=tcmb:tcmb_car,c=1] if entity @s[tag=only_vol2] at @s run tag @s add voltage_1