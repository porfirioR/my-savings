"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberModel = void 0;
class MemberModel {
    constructor(id, groupId, firstName, lastName, phone, position, isActive, joinedMonth, joinedYear, leftMonth, leftYear, createdAt, updatedAt) {
        this.id = id;
        this.groupId = groupId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.position = position;
        this.isActive = isActive;
        this.joinedMonth = joinedMonth;
        this.joinedYear = joinedYear;
        this.leftMonth = leftMonth;
        this.leftYear = leftYear;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
exports.MemberModel = MemberModel;
//# sourceMappingURL=member-model.js.map