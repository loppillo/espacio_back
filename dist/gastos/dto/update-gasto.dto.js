"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGastoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_gasto_dto_1 = require("./create-gasto.dto");
class UpdateGastoDto extends (0, mapped_types_1.PartialType)(create_gasto_dto_1.CreateGastoDto) {
}
exports.UpdateGastoDto = UpdateGastoDto;
//# sourceMappingURL=update-gasto.dto.js.map