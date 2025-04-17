"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$setGuessNumberRange",
    version: "1.0.0",
    description: "Sets min and max range for Guess the Number.",
    unwrap: true,
    args: [
        forgescript_1.Arg.requiredNumber("min", "Minimum number."),
        forgescript_1.Arg.requiredNumber("max", "Maximum number."),
    ],
    brackets: true,
    async execute(ctx, [min, max]) {
        let opts = ctx.getEnvironmentKey("__guess_number__game__options__");
        if (typeof opts !== "object")
            return this.customError("Use inside $startGuessNumberGame.");
        if (min >= max)
            return this.customError("Minimum must be less than maximum.");
        opts.min = min;
        opts.max = max;
        ctx.setEnvironmentKey("__guess_number__game__options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setGuessNumberRange.js.map