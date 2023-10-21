execute as @s[type=tcmb:tcmb_car,tag=!open_all,tag=!open_a,tag=!open_oneman_a,tag=!open_b,tag=!open_oneman_b,tag=!backward,scores={speed=0..1}] at @s run summon tcmb:tcmb_starter ^1^^ 
execute as @s[type=tcmb:tcmb_car,tag=!open_all,tag=!open_a,tag=!open_oneman_a,tag=!open_b,tag=!open_oneman_b,tag=backward,scores={speed=0..1}] at @s run summon tcmb:tcmb_starter ^-1^^ 
scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_child,tag=!stopping,tag=max_20km,scores={speed=..19}] speed 1
scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_child,tag=!stopping,tag=max_80km,scores={speed=..79}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_120km,scores={speed=..119}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_130km,scores={speed=..129}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_160km,scores={speed=..159}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_200km,scores={speed=..199}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_240km,scores={speed=..239}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_280km,scores={speed=..279}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_300km,scores={speed=..299}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_320km,scores={speed=..319}] speed 1
execute if score "#fast_run" option matches 1 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=max_360km,scores={speed=..359}] speed 1
execute if score "#fast_run" option matches 0 run scoreboard players add @s[type=tcmb:tcmb_car,tag=!tc_parent,tag=!tc_child,tag=!stopping,tag=!max_20km,tag=!max_80km,scores={speed=..107}] speed 1
scoreboard players add @s[type=tcmb:tcmb_car,tag=tc_parent,tag=!stopping,tag=!max_20km,tag=!max_80km,scores={speed=..107}] speed 1