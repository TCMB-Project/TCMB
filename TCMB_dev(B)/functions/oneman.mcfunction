execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=oneman] at @s run tag @e[tag=body,r=1] add onemanoff
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=oneman] at @s run tag @s add onemanoff
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!oneman] at @s run tag @e[tag=body,r=1] add oneman
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!oneman] at @s run tag @s add oneman
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=onemanoff] at @s run tag @e[tag=body,r=1] remove oneman
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=onemanoff] at @s run tag @s remove oneman
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=onemanoff] at @s run tag @e[tag=body,r=1] remove onemanoff
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=onemanoff] at @s run tag @s remove onemanoff