/**
 * Data Validation Script for Tokyo Waterbus Atlas
 * Run with: npm run validate:data
 */

import { ROUTES } from '../src/data/routes.js';
import { PIERS } from '../src/data/piers.js';
import { VESSELS } from '../src/data/vessels.js';
import { GUIDES } from '../src/data/guides.js';
import { LANDMARKS } from '../src/data/landmarks.js';

let errors = [];
let warnings = [];

console.log('🔍 Validating Tokyo Waterbus Atlas Data Modules...\n');

// 1. Validate Routes
console.log(`Checking ${ROUTES.length} routes...`);
if (ROUTES.length < 6) {
  errors.push(`Expected at least 6 route groups, found ${ROUTES.length}`);
}

const routeIds = new Set(ROUTES.map(r => r.id));
ROUTES.forEach((route, index) => {
  if (!route.id) errors.push(`Route [${index}] missing 'id'`);
  if (!route.name || !route.name.zhHant || !route.name.ja || !route.name.en) {
    errors.push(`Route ${route.id} missing multilingual 'name'`);
  }
  if (!route.operator) errors.push(`Route ${route.id} missing 'operator'`);
  if (!route.sourceUrl) errors.push(`Route ${route.id} missing 'sourceUrl'`);
  if (!route.dataConfidence) errors.push(`Route ${route.id} missing 'dataConfidence'`);
  if (!Array.isArray(route.path) || route.path.length < 2) {
    errors.push(`Route ${route.id} path must be an array with at least 2 points`);
  } else {
    route.path.forEach((pt, ptIdx) => {
      if (!Array.isArray(pt) || pt.length !== 2 || typeof pt[0] !== 'number' || typeof pt[1] !== 'number') {
        errors.push(`Route ${route.id} path point [${ptIdx}] invalid: ${JSON.stringify(pt)}`);
      } else {
        const [lat, lon] = pt;
        if (lat < 35.5 || lat > 35.8 || lon < 139.6 || lon > 140.0) {
          warnings.push(`Route ${route.id} point [${ptIdx}] outside standard Tokyo Bay bounding box: [${lat}, ${lon}]`);
        }
      }
    });
  }
});

// 2. Validate Piers
console.log(`Checking ${PIERS.length} piers...`);
if (PIERS.length < 10) {
  errors.push(`Expected at least 10 piers, found ${PIERS.length}`);
}

const pierIds = new Set(PIERS.map(p => p.id));
PIERS.forEach((pier, index) => {
  if (!pier.id) errors.push(`Pier [${index}] missing 'id'`);
  if (!pier.name || !pier.name.zhHant || !pier.name.ja || !pier.name.en) {
    errors.push(`Pier ${pier.id} missing multilingual 'name'`);
  }
  if (!Array.isArray(pier.coordinates) || pier.coordinates.length !== 2) {
    errors.push(`Pier ${pier.id} invalid 'coordinates'`);
  } else {
    const [lat, lon] = pier.coordinates;
    if (lat < 35.5 || lat > 35.8 || lon < 139.6 || lon > 140.0) {
      errors.push(`Pier ${pier.id} coordinates outside Tokyo area: [${lat}, ${lon}]`);
    }
  }
  if (!Array.isArray(pier.routes)) {
    errors.push(`Pier ${pier.id} 'routes' must be an array`);
  } else {
    pier.routes.forEach(rId => {
      if (!routeIds.has(rId)) {
        errors.push(`Pier ${pier.id} references unknown routeId '${rId}'`);
      }
    });
  }
});

// Cross-check: Route piers exist in PIERS
ROUTES.forEach(route => {
  if (Array.isArray(route.piers)) {
    route.piers.forEach(pId => {
      if (!pierIds.has(pId)) {
        errors.push(`Route ${route.id} references unknown pierId '${pId}'`);
      }
    });
  }
});

// 3. Validate Vessels
console.log(`Checking ${VESSELS.length} vessels...`);
if (VESSELS.length < 8) {
  errors.push(`Expected at least 8 vessels, found ${VESSELS.length}`);
}

VESSELS.forEach((vessel, index) => {
  if (!vessel.id) errors.push(`Vessel [${index}] missing 'id'`);
  if (!vessel.displayName) errors.push(`Vessel ${vessel.id} missing 'displayName'`);
  if (!vessel.routeId || !routeIds.has(vessel.routeId)) {
    errors.push(`Vessel ${vessel.id} references invalid routeId '${vessel.routeId}'`);
  }
  if (vessel.dataMode !== 'simulated') {
    errors.push(`Vessel ${vessel.id} 'dataMode' must strictly be 'simulated'`);
  }
  if (!vessel.simulation || typeof vessel.simulation.frequencyMinutes !== 'number') {
    errors.push(`Vessel ${vessel.id} missing valid simulation timetable parameters`);
  }
});

// 4. Validate Guides
console.log(`Checking ${GUIDES.length} guide scenarios...`);
if (GUIDES.length < 5) {
  errors.push(`Expected at least 5 guide scenarios, found ${GUIDES.length}`);
}

GUIDES.forEach(guide => {
  if (!guide.id) errors.push(`Guide missing 'id'`);
  if (guide.recommendation && guide.recommendation.routeId && !routeIds.has(guide.recommendation.routeId)) {
    errors.push(`Guide ${guide.id} references unknown routeId '${guide.recommendation.routeId}'`);
  }
});

// Output Summary
console.log('\n----------------------------------------');
if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} Warning(s):`);
  warnings.forEach(w => console.log(`   - ${w}`));
}

if (errors.length > 0) {
  console.error(`❌ Validation Failed with ${errors.length} Error(s):`);
  errors.forEach(e => console.error(`   - ${e}`));
  process.exit(1);
} else {
  console.log('✅ Data Validation Passed Successfully!');
  console.log(`   - ${ROUTES.length} Routes Verified`);
  console.log(`   - ${PIERS.length} Piers Verified`);
  console.log(`   - ${VESSELS.length} Vessels Verified`);
  console.log(`   - ${GUIDES.length} Guides Verified`);
  console.log(`   - ${LANDMARKS.length} Landmarks Verified`);
}
