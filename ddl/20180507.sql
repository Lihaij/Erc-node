SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_erc_corporateclients MODIFY COLUMN month_settlement int(11) DEFAULT NULL;
/*end ty */

/* ls */
DROP TABLE IF EXISTS `tbl_erc_department`;
CREATE TABLE `tbl_erc_department` (
    `department_id` varchar(30) NOT NULL,
    `domain_id` bigint(20) NOT NULL,
    `department_name` varchar(50),
    `p_department_id` varchar(30),
    `department_level` varchar(4),
    `department_plan_num` int DEFAULT 0,
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`department_id`)
);

DROP TABLE IF EXISTS `tbl_erc_position`;
CREATE TABLE `tbl_erc_position` (
    `position_id` varchar(30) NOT NULL,
    `usergroup_id` bigint(20) NOT NULL,
    `domain_id` bigint(20) NOT NULL,
    `department_id` varchar(30) NOT NULL,
    `position_name` varchar(50),
    `p_position_id` varchar(30),
    `department_plan_num` int DEFAULT 0,
    `base_salary` int DEFAULT 0,
    `capacity_salary` int DEFAULT 0,
    `performance_salary` int DEFAULT 0,
    `actual_salary` int DEFAULT 0,
    `department_actual_num` int DEFAULT 0,
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`position_id`)
);

INSERT INTO `seqmysql` VALUES ('departmentIDSeq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('positionIDSeq', '0', '1', '99999999');

-- call Pro_AddMenu('行政办公管理', '部门维护', '/erc/baseconfig/ERCDepartmentControl', 'ERCDEPARTMENTCONTROL');
-- call Pro_AddMenu('行政办公管理', '岗位维护', '/erc/baseconfig/ERCUsergroupControl', 'ERCUSERGROUPCONTROL');

/*end ls */
