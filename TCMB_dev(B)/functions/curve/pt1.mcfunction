execute as @e[tag=car1,r=1] at @s if block ^1^1^17.5 structure_void -1 run tp @s ~~~~-3
execute as @e[tag=car1,r=1] at @s if block ^-1^1^17.5 structure_void -1 run tp @s ~~~~3
execute as @e[tag=car2,r=1] at @s if block ^-1^1^-17.5 structure_void -1 run tp @s ~~~~-3
execute as @e[tag=car2,r=1] at @s if block ^1^1^-17.5 structure_void -1 run tp @s ~~~~3