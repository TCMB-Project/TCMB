execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run playsound notch @a[r=25]
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=backward] at @s run tag @e[tag=body,r=1] add front
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=backward] at @s run tag @s add front
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!backward] at @s run tag @e[tag=body,r=1] add backward
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!backward] at @s run tag @s add backward
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=front] at @s run tag @e[tag=body,r=1] remove backward
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=front] at @s run tag @s remove backward
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=front] at @s run tag @e[tag=body,r=1] remove front
execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=front] at @s run tag @s remove front