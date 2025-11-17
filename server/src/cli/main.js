#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command, program } from "commander";
import { login, logout, whoami } from "./commands/auth/login.js";
import { wakeup } from "./commands/ai/wakeUp.js";

dotenv.config();

async function main() {
  // Sexy Banner
  console.log(
    chalk.hex("#6A5ACD")(
      figlet.textSync("Maverick", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 120
      })
    )
  );

  console.log(
    chalk.greenBright("<---- Intelligent Command Line Interface ---->\n")
  );


  const program = new Command("Maverick");
  program.version("1.4.3")
  .description("Maverick Cli - A cli based AI tool")
  .addCommand(login)
  .addCommand(logout)
  .addCommand(whoami)
  .addCommand(wakeup)

  program.action(()=>{
    program.help();
})

program.parse()
}



main().catch((err)=>{
    console.log(chalk.red("Error : Maverick don't wanna shown UP..!!; Because of this ->"),err)
    process.exit(1)
});
