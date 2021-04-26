import { expect } from "iko"
import { determineNavigatorLanguage } from "../src/utils"


type NavigatorMock = {-readonly [P in keyof Navigator]?: Navigator[P]}
declare global {
    namespace NodeJS {
        interface Global {
            navigator: NavigatorMock
        }
    }
}

global.navigator = {} as any as Navigator

describe("utils", () => {
    describe("determineNavigatorLanguage", () => {
        describe("using navigator.language", () => {
            before(() => {
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).language  = "de";
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).languages  = undefined;
            })
    
            it("should return preferred language", () => {
                expect(determineNavigatorLanguage()).toBe("de")
            })    
        })

        describe("using navigator.languages", () => {
            before(() => {
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).language  = undefined;
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).languages  = ["de-DE", "en-US", "en"];
            })
    
            it("should return preferred language", () => {
                expect(determineNavigatorLanguage()).toBe("de")
            })    
        })
    })
})