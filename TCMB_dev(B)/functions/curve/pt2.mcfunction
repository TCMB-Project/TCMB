execute as @e[tag=car1,r=1] at @s if block ^1^2^17.5 structure_void -1 run scriptevent tcmb_minecart_engine:rotate -3
execute as @e[tag=car1,r=1] at @s if block ^-1^2^17.5 structure_void -1 run scriptevent tcmb_minecart_engine:rotate 3
execute as @e[tag=car2,r=1] at @s if block ^-1^2^-17.5 structure_void -1 run scriptevent tcmb_minecart_engine:rotate -3
execute as @e[tag=car2,r=1] at @s if block ^1^2^-17.5 structure_void -1 run scriptevent tcmb_minecart_engine:rotate 3