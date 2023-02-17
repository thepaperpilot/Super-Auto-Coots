import { Visibility } from "features/feature";
import { createResource, Resource } from "features/resources/resource";
import Formula from "game/formulas";
import {
    createBooleanRequirement,
    createCostRequirement,
    createVisibilityRequirement,
    maxRequirementsMet,
    payRequirements,
    Requirement,
    requirementsMet
} from "game/requirements";
import { beforeAll, describe, expect, test } from "vitest";
import { isRef, ref, unref } from "vue";
import "../utils";

describe("Creating cost requirement", () => {
    describe("Minimal requirement", () => {
        let resource: Resource;
        let requirement: Requirement;
        beforeAll(() => {
            resource = createResource(ref(10));
            requirement = createCostRequirement(() => ({
                resource,
                cost: 10
            }));
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        test("resource pass-through", () => expect((requirement as any).resource).toBe(resource));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        test("cost pass-through", () => expect((requirement as any).cost).toBe(10));

        test("partialDisplay exists", () =>
            expect(typeof requirement.partialDisplay).toBe("function"));
        test("display exists", () => expect(typeof requirement.display).toBe("function"));
        test("pay exists", () => expect(typeof requirement.pay).toBe("function"));
        test("requirementMet exists", () => {
            expect(requirement.requirementMet).not.toBeNull();
            expect(isRef(requirement.requirementMet)).toBe(true);
        });
        test("is visible", () => expect(requirement.visibility).toBe(Visibility.Visible));
        test("requires pay", () => expect(requirement.requiresPay).toBe(true));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        test("spends resources", () => expect((requirement as any).spendResources).toBe(true));
        test("cannot maximize", () => expect(unref(requirement.canMaximize)).toBe(false));
    });

    describe("Fully customized", () => {
        let resource: Resource;
        let requirement: Requirement;
        beforeAll(() => {
            resource = createResource(ref(10));
            requirement = createCostRequirement(() => ({
                resource,
                cost: 10,
                visibility: Visibility.None,
                requiresPay: false,
                maximize: true,
                spendResources: false,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                pay() {}
            }));
        });

        test("pay is empty function", () =>
            requirement.pay != null &&
            typeof requirement.pay === "function" &&
            requirement.pay.length === 1);
        test("is not visible", () => expect(requirement.visibility).toBe(Visibility.None));
        test("does not require pay", () => expect(requirement.requiresPay).toBe(false));
        test("does not spend resources", () =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((requirement as any).spendResources).toBe(false));
        test("can maximize", () => expect(unref(requirement.canMaximize)).toBe(true));
    });

    test("Requirement met when meeting the cost", () => {
        const resource = createResource(ref(10));
        const requirement = createCostRequirement(() => ({
            resource,
            cost: 10
        }));
        expect(unref(requirement.requirementMet)).toBe(true);
    });

    test("Requirement not met when not meeting the cost", () => {
        const resource = createResource(ref(10));
        const requirement = createCostRequirement(() => ({
            resource,
            cost: 100
        }));
        expect(unref(requirement.requirementMet)).toBe(false);
    });
});

describe("Creating visibility requirement", () => {
    test("Requirement met when visible", () => {
        const requirement = createVisibilityRequirement({ visibility: Visibility.Visible });
        expect(unref(requirement.requirementMet)).toBe(true);
    });

    test("Requirement not met when not visible", () => {
        let requirement = createVisibilityRequirement({ visibility: Visibility.None });
        expect(unref(requirement.requirementMet)).toBe(false);
        requirement = createVisibilityRequirement({ visibility: Visibility.Hidden });
        expect(unref(requirement.requirementMet)).toBe(false);
    });
});

describe("Creating boolean requirement", () => {
    test("Requirement met when true", () => {
        const requirement = createBooleanRequirement(ref(true));
        expect(unref(requirement.requirementMet)).toBe(true);
    });

    test("Requirement not met when false", () => {
        const requirement = createBooleanRequirement(ref(false));
        expect(unref(requirement.requirementMet)).toBe(false);
    });
});

describe("Checking all requirements met", () => {
    let metRequirement: Requirement;
    let unmetRequirement: Requirement;
    beforeAll(() => {
        metRequirement = createBooleanRequirement(true);
        unmetRequirement = createBooleanRequirement(false);
    });

    test("Returns true if no requirements", () => {
        expect(requirementsMet([])).toBe(true);
    });

    test("Returns true if all requirements met", () => {
        expect(requirementsMet([metRequirement, metRequirement])).toBe(true);
    });

    test("Returns false if any requirements unmet", () => {
        expect(requirementsMet([metRequirement, unmetRequirement])).toBe(false);
    });
});

describe("Checking maximum levels of requirements met", () => {
    test("Returns 0 if any requirement is not met", () => {
        const requirements = [
            createBooleanRequirement(false),
            createBooleanRequirement(true),
            createCostRequirement(() => ({
                resource: createResource(ref(10)),
                cost: Formula.variable(0)
            }))
        ];
        expect(maxRequirementsMet(requirements)).compare_tolerance(0);
    });

    test("Returns correct number of requirements met", () => {
        const requirements = [
            createBooleanRequirement(true),
            createCostRequirement(() => ({
                resource: createResource(ref(10)),
                cost: Formula.variable(0)
            }))
        ];
        expect(maxRequirementsMet(requirements)).compare_tolerance(10);
    });
});

test("Paying requirements", () => {
    const resource = createResource(ref(100));
    const noPayment = createCostRequirement(() => ({
        resource,
        cost: 10,
        requiresPay: false
    }));
    const payment = createCostRequirement(() => ({
        resource,
        cost: 10
    }));
    payRequirements([noPayment, payment]);
    expect(resource.value).compare_tolerance(90);
});
