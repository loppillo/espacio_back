"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHorarioDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_horario_dto_1 = require("./create-horario.dto");
class UpdateHorarioDto extends (0, mapped_types_1.PartialType)(create_horario_dto_1.CreateHorarioDto) {
}
exports.UpdateHorarioDto = UpdateHorarioDto;
//# sourceMappingURL=update-horario.dto.js.map