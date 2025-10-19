#!/usr/bin/env node --import tsx
import 'dotenv/config'
import {program} from 'commander';
import InitCommand from './init.js'
import {MakeModelCommand, MakeMigrationCommand, MakeTypesCommand} from './make.js';
import {MigrateCommand, RollbackCommand, StatusCommand} from './migrate.js';

program
  .description('Elegant Command Line Utility')
  .version('1.0.0')
  .addCommand(InitCommand)
  .addCommand(MakeModelCommand)
  .addCommand(MakeMigrationCommand)
  .addCommand(MakeTypesCommand)
  .addCommand(MigrateCommand)
  .addCommand(RollbackCommand)
  .addCommand(StatusCommand)
  .parse();
