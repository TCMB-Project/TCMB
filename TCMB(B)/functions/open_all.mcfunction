tag @s[scores={speed=0}] add stopping
tag @s[scores={speed=0}] remove ato_on
execute as @s[scores={speed=0}] at @s run tag @e[tag=body,r=1] remove ato_on
tag @s remove open_a
tag @s remove oneman_open_a
tag @s remove open_b
tag @s remove oneman_open_b
tag @s remove open_all
tag @s add open_all
scriptevent tcmb:engine_door open_all
function pdft/open_all