import * as lolcat from "lolcatjs"

lolcat.options.seed = Math.round(Math.random() * 1000)
lolcat.options.colors = true

lolcat.fromFile(process.argv[1])