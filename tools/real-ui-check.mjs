// Run with NODE_PATH pointing to the desktop's bundled playwright packages.
import {createRequire} from 'node:module';
createRequire(import.meta.url)('./real-ui-check.cjs');
