#!/usr/bin/env node --import tsx
import {program} from 'commander';
import InitCommand from './init'
import MigrateCommand from './migrate'

program
  .description('Elegant Command Line Utility')
  .version('1.0.0')
  .addCommand(InitCommand)
  .addCommand(MigrateCommand)
  .parse();
