"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePropinaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_propina_dto_1 = require("./create-propina.dto");
class UpdatePropinaDto extends (0, mapped_types_1.PartialType)(create_propina_dto_1.CreatePropinaDto) {
}
exports.UpdatePropinaDto = UpdatePropinaDto;
//# sourceMappingURL=update-propina.dto.js.map