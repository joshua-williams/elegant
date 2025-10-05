#!/usr/bin/env node --import tsx
import 'dotenv/config'
import {program} from 'commander';
import InitCommand from './init'
import {MakeCommand} from './make';
import {MigrateCommand, RollbackCommand} from './migrate';

program
  .description('Elegant Command Line Utility')
  .version('1.0.0')
  .addCommand(InitCommand)
  .addCommand(MakeCommand)
  .addCommand(MigrateCommand)
  .addCommand(RollbackCommand)
  .parse();
