
DROP TABLE IF EXISTS `tbl_erc_archives`;

CREATE TABLE `tbl_erc_archives` (
  `archives_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `archives_type` int(11) NOT NULL,
  `archives_no` varchar(50) DEFAULT NULL,
  `archives_name` varchar(100) NOT NULL,
  `department_id` varchar(50) DEFAULT '',
  `keep_time` int(11) DEFAULT NULL,
  `keep_begin_date` datetime DEFAULT NULL,
  `keep_end_date` datetime DEFAULT NULL,
  `instruction` varchar(1024) DEFAULT NULL,
  `archives_file_id` bigint(20) DEFAULT NULL,
  `archiveshand_id` int(11) DEFAULT NULL,
  `archives_state` int(11) DEFAULT NULL,
  `predepartment_id` varchar(50) DEFAULT '',
  `prekeep_date` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`archives_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

/*Table structure for table `tbl_erc_archives_base` */

DROP TABLE IF EXISTS `tbl_erc_archives_base`;

CREATE TABLE `tbl_erc_archives_base` (
  `archivesbase_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `archives_type` int(11) NOT NULL,
  `build_time` int(11) DEFAULT NULL,
  `manage_time` int(11) DEFAULT NULL,
  `dep_keeper_id` varchar(50) DEFAULT NULL,
  `company_keeper_id` varchar(50) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`archivesbase_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `tbl_erc_archivesuse` */

DROP TABLE IF EXISTS `tbl_erc_archivesuse`;

CREATE TABLE `tbl_erc_archivesuse` (
  `archivesuse_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `archives_id` bigint(20) DEFAULT NULL,
  `archivesuse_state` int(11) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `purpose` varchar(200) DEFAULT NULL,
  `use_date` datetime DEFAULT NULL,
  `checker_id` varchar(50) DEFAULT NULL,
  `check_date` datetime DEFAULT NULL,
  `refuse_remark` varchar(200) DEFAULT NULL,
  `revert_state` int(11) DEFAULT NULL,
  `revert_date` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`archivesuse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `tbl_erc_archiveshand`;

CREATE TABLE `tbl_erc_archiveshand` (
  `archiveshand_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `archiveshand_type` int(11) DEFAULT NULL,
  `archiveshand_name` varchar(100) DEFAULT NULL,
  `department_keeper` varchar(100) DEFAULT NULL,
  `domain_keeper` varchar(100) DEFAULT NULL,
  `archiveshand_state` int(11) DEFAULT '1',
  `place_date` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`archiveshand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `tbl_erc_certificate`;

CREATE TABLE `tbl_erc_certificate` (
  `certificate_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `certificate_number` varchar(100) DEFAULT NULL,
  `certificate_name` varchar(100) DEFAULT NULL,
  `certificate_type` int(11) DEFAULT NULL,
  `organization` varchar(100) DEFAULT NULL,
  `validity_start` datetime DEFAULT NULL,
  `validity_end` datetime DEFAULT NULL,
  `inspect_date` datetime DEFAULT NULL,
  `keeper` varchar(100) DEFAULT NULL,
  `certificate_state` int(11) DEFAULT '1',
  `ground_acreage` varchar(100) DEFAULT NULL,
  `build_acreage` varchar(100) DEFAULT NULL,
  `is_public` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`certificate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `tbl_erc_certificateuse`;

CREATE TABLE `tbl_erc_certificateuse` (
  `certificateuse_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `certificate_id` int(11) DEFAULT NULL,
  `domain_id` int(11) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `use_reason` varchar(200) DEFAULT NULL,
  `revert_state` int(11) DEFAULT '0',
  `revert_date` datetime DEFAULT NULL,
  `revert_date_actual` datetime DEFAULT NULL,
  `checker_id` varchar(100) DEFAULT NULL,
  `check_date` datetime DEFAULT NULL,
  `refuse_remark` varchar(200) DEFAULT NULL,
  `certificateuse_state` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`certificateuse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `tbl_erc_sealcreate`;

CREATE TABLE `tbl_erc_sealcreate` (
  `sealcreate_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `sealcreate_name` varchar(50) DEFAULT NULL,
  `sealcreate_type` int(11) DEFAULT NULL,
  `sealcreate_state` int(11) DEFAULT NULL,
  `purpose` varchar(200) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `material` varchar(200) DEFAULT NULL,
  `content` varchar(400) DEFAULT NULL,
  `keeper` varchar(50) DEFAULT NULL,
  `use_range` varchar(200) DEFAULT NULL,
  `checker_id` varchar(50) DEFAULT NULL,
  `check_date` datetime DEFAULT NULL,
  `refuse_remark` varchar(200) DEFAULT NULL,
  `is_borrow` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_discard` int(11) DEFAULT '0',
  `is_finish` int(11) DEFAULT '0',
  PRIMARY KEY (`sealcreate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `tbl_erc_sealdiscard`;

CREATE TABLE `tbl_erc_sealdiscard` (
  `sealdiscard_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `sealcreate_id` int(11) DEFAULT NULL,
  `sealdiscard_state` int(11) DEFAULT NULL,
  `checker_id` varchar(50) DEFAULT NULL,
  `check_date` datetime DEFAULT NULL,
  `refuse_remark` varchar(200) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`sealdiscard_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `tbl_erc_sealuse`;

CREATE TABLE `tbl_erc_sealuse` (
  `sealuse_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `sealcreate_id` bigint(20) DEFAULT NULL,
  `sealuse_state` int(11) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `purpose` varchar(200) DEFAULT NULL,
  `use_date` datetime DEFAULT NULL,
  `is_borrow` int(11) DEFAULT '0',
  `borrow_start` datetime DEFAULT NULL,
  `borrow_end` datetime DEFAULT NULL,
  `checker_id` varchar(50) DEFAULT NULL,
  `check_date` datetime DEFAULT NULL,
  `refuse_remark` varchar(200) DEFAULT NULL,
  `revert_state` int(11) DEFAULT NULL,
  `revert_date` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`sealuse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4;


insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('档案管理','00','0',1,NOW(),NOW());
insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('证照管理','00','0',1,NOW(),NOW());
insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('印章管理','00','0',1,NOW(),NOW());

call Pro_AddMenu('档案管理', '档案信息录入','/erc/baseconfig/ERCArchivesControl','ERCARCHIVESCONTROL');
call Pro_AddMenu('档案管理', '档案外借申请','/erc/baseconfig/ERCArchiveSUseControl','ERCARCHIVESUSECONTROL');
call Pro_AddMenu('档案管理', '档案信息查询','/erc/baseconfig/ERCArchivesControl','ERCARCHIVESLISTCONTROL');
call Pro_AddMenu('档案管理', '应交档案','/erc/baseconfig/ERCArchivesHandControl','ERCARCHIVESHANDCONTROL');
call Pro_AddMenu('证照管理', '证照信息录入','/erc/baseconfig/ERCCertificateControl','ERCCERTIFICATECONTROL');
call Pro_AddMenu('证照管理', '证照外借申请','/erc/baseconfig/ERCCertificateUseControl','ERCCERTIFICATEUSECONTROL');
call Pro_AddMenu('证照管理', '证照列表','/erc/baseconfig/ERCCertificateListControl','ERCCERTIFICATELISTCONTROL');
call Pro_AddMenu('印章管理', '印章刻印申请','/erc/baseconfig/ERCSealControl','ERCSEALCONTROL');
call Pro_AddMenu('印章管理', '用章申请','/erc/baseconfig/ERCSealUseControl','ERCSEALUSECONTROL');
call Pro_AddMenu('印章管理', '印章报废申请','/erc/baseconfig/ERCSealDiscardControl','ERCSEALDISCARDCONTROL');
call Pro_AddMenu('印章管理', '印章列表','/erc/baseconfig/ERCSealListControl','ERCSEALLISTCONTROL');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(201 , '印章刻印审核任务' , '印章刻印审核任务', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(202 , '用章审核任务' , '分配用章审核人员', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(204 , '印章报废审核任务' , '分配印章报废审核人员', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(205 , '证照外借审核' , '分配证照外借审核人员', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(206 , '证照外借归位审核' , '分配证照外借归位审核人员', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(210 , '档案外借审核' , '分配档案外借审核人员', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(211 , '档案外借归位' , '分配档案归位审核人员', now(), now());