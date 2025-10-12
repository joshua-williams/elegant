#!/usr/bin/env node
import 'dotenv/config'
import {program} from 'commander';
import InitCommand from './init.js'
import {MakeCommand} from './make.js';
import {MigrateCommand, RollbackCommand, StatusCommand} from './migrate.js';

program
  .description('Elegant Command Line Utility')
  .version('1.0.0')
  .addCommand(InitCommand)
  .addCommand(MakeCommand)
  .addCommand(MigrateCommand)
  .addCommand(RollbackCommand)
  .addCommand(StatusCommand)
  .parse();
