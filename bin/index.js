#!/usr/bin/env node

import fs from "fs";
import path, { dirname } from "path";
import chalk from 'chalk';
import Conf from "conf";
import yargs from "yargs";
import { hideBin } from "yargs/helpers"
import inquirer from "inquirer";

const config = new Conf({ projectName: "re4-remake-backup-manager" })
const program = yargs(hideBin(process.argv))

program.command('save [path]', 'copy save file to destination path', (e) => {
    return e.positional('path', {
        type: 'string',
        describe: 'absolute path to save',
    })
}, (argv) => {
    saveFolder(argv.path)
})

program.command('load', 'load file to destination path', () => { }, (_) => loadFolder())

program.parse()

function saveFolder(dest) {
    const target = "C:\\Users\\Public\\Documents\\EMPRESS";
    if (!fs.existsSync(target)) {
        console.log(chalk.red(`save folder does not exist: ${target}`));
        process.exit(1)
    }

    if (!dest) {
        dest = config.get('savePath') || 'D:\\RE4BACKUP'
    } else {
        dest = path.resolve(dest, "RE4BACKUP")
    }
    config.set('savePath', dest)

    const now = new Date();
    const currentDate = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`
    const currentTime = `${now.getHours()}h${now.getMinutes()}m${now.getSeconds()}s`
    const timeName = `${currentDate} ${currentTime}`

    dest = path.join(dest, timeName, "EMPRESS")
    fs.cpSync(target, dest, {
        recursive: true
    })
    console.log(chalk.green('success!'));
}

async function loadFolder() {
    const savePath = config.get('savePath')
    if (!fs.existsSync(savePath)) {
        console.log(chalk.red(`save folder does not exist: ${savePath}`));
        process.exit(1)
    }

    const dirNames = fs.readdirSync(savePath)

    const answer = await inquirer.prompt({
        name: 'select',
        type: 'list',
        message: 'Select one to load',
        choices: dirNames
    })

    const selectedDirName = answer.select
    const source = path.join(savePath, selectedDirName, "EMPRESS")
    const dest = "C:\\Users\\Public\\Documents\\EMPRESS";
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, {
            recursive: true,
            force: true,
        })
    }

    fs.cpSync(source, dest, {
        recursive: true
    })

    console.log(chalk.green('success!'));
}