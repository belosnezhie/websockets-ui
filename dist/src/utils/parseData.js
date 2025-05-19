"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseData = void 0;
const parseData = (data) => {
    try {
        if (data === '')
            return;
        return JSON.parse(data);
    }
    catch (err) {
        throw new Error(`Invalid data: ${err.message}`);
    }
};
exports.parseData = parseData;
//# sourceMappingURL=parseData.js.map