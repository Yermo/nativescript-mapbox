
import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";

/**
* Iterate navigation between the home and test crash pages
*/

async function HomeToTestCrashNavigation( driver : any, group : number, iterations : number ) {

  let timestamp : number = 0;

  for ( let i = 0; i < iterations; i++ ) {

    timestamp = Date.now();

    let btn = await driver.findElementByClassName('android.widget.ImageButton');
    await btn.click();

    console.log( "Page Navigation " + group + ' ' + i + " RadDrawerButton Click From Home " + ( Date.now() - timestamp ) );

    timestamp = Date.now();

    btn = await driver.findElementByAutomationText("Test Crash");
    await btn.click();
    console.log( "Page Navigation " + group + ' ' + i + " Test Crash Navigation " + ( Date.now() - timestamp ) );

    timestamp = Date.now();

    btn = await driver.findElementByClassName('android.widget.ImageButton');
    await btn.click();

    console.log( "Page Navigation " + group + ' ' + i + " RadDrawerButton Click From Test Crash " + ( Date.now() - timestamp ) );

    timestamp = Date.now();

    btn = await driver.findElementByAutomationText( "Home" );
    await btn.click();

    console.log( "Page Navigation " + group + ' ' + i + " Home Navigation " + ( Date.now() - timestamp ) );

    }
}

// -------------------------------------------------------------------------------------------
/**
* Test Rad Drawer Crash
*/

describe( "Rad Drawer View Navigation Crash", async () => {
    const defaultWaitTime = 60 * 60 * 1000;
    let driver: AppiumDriver;

    before(async function(){
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
    });

    after(async function () {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    // FIXME: How to specify that this test should run indefinitely?

    it( "should repeatedly navigate between Home and Test Crash 50 times", async function () {
      await HomeToTestCrashNavigation( driver, 1,  50 );
    });

    it( "should repeatedly navigate between Home and Test Crash 50 times", async function () {
      await HomeToTestCrashNavigation( driver, 2, 50 );
    });

    it( "should repeatedly navigate between Home and Test Crash 50 times", async function () {
      await HomeToTestCrashNavigation( driver, 3, 50 );
    });

    it( "should repeatedly navigate between Home and Test Crash 50 times", async function () {
      await HomeToTestCrashNavigation( driver, 4, 50 );
    });

});
