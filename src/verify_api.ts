import express from 'express';
import productRouter from './routes/productRoutes';

const app = express();
app.use('/api/products', productRouter);

// Simple test framework
async function runTests() {
  console.log("=== RUNNING SCANNER BACKEND API TESTS ===");
  
  const testCases = [
    { sku: 'ATV320U15N4C', expectedStatus: 200, expectSuccess: true },
    { sku: 'VW3A3201', expectedStatus: 200, expectSuccess: true },
    { sku: 'VW3A1104', expectedStatus: 200, expectSuccess: true },
    { sku: 'VW3M7101', expectedStatus: 200, expectSuccess: true },
    { sku: 'VW3A3607', expectedStatus: 200, expectSuccess: true },
    { sku: 'INVALID_SKU_TEST', expectedStatus: 404, expectSuccess: false }
  ];

  let failed = false;

  // Start the server once on an ephemeral port
  const server = app.listen(0);
  const address = server.address() as any;
  const port = address.port;

  for (const tc of testCases) {
    try {
      console.log(`\nTesting SKU: "${tc.sku}"`);
      const response = await fetch(`http://localhost:${port}/api/products/scan/${tc.sku}`);
      const data = await response.json() as any;

      console.log(`Response Status: ${response.status}`);
      console.log(`Response Data Success: ${data.success}`);

      if (response.status !== tc.expectedStatus) {
        console.error(`❌ FAILED: Expected status ${tc.expectedStatus}, got ${response.status}`);
        failed = true;
        continue;
      }

      if (data.success !== tc.expectSuccess) {
        console.error(`❌ FAILED: Expected success ${tc.expectSuccess}, got ${data.success}`);
        failed = true;
        continue;
      }

      if (tc.expectSuccess) {
        if (!data.product || data.product.sku !== tc.sku) {
          console.error(`❌ FAILED: Returned product SKU "${data.product?.sku}" does not match requested "${tc.sku}"`);
          failed = true;
          continue;
        }
        console.log(`✅ PASSED: Loaded product: ${data.product.name}`);
      } else {
        if (data.success === true) {
          console.error(`❌ FAILED: Expected failure for invalid SKU, but got success`);
          failed = true;
          continue;
        }
        console.log(`✅ PASSED: Handled invalid SKU correctly (Status 404, Message: ${data.message})`);
      }
    } catch (e) {
      console.error(`❌ Error during test:`, e);
      failed = true;
    }
  }

  // Close the server once
  server.close();

  console.log("\n==========================================");
  if (failed) {
    console.error("❌ SOME TESTS FAILED!");
    process.exit(1);
  } else {
    console.log("🎉 ALL SCANNER API TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  }
}

runTests();
