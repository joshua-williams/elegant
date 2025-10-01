#!/usr/bin/env node --import tsx
import {program} from 'commander';
import InitCommand from './init'

program
  .description('Elegant Command Line Utility')
  .version('1.0.0')
  .addCommand(InitCommand)
  .parse();
