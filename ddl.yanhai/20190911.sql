/*评分设置表*/
CREATE TABLE `tbl_erc_grade` (
  `grade_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `grade_number` bigint(20) DEFAULT NULL,
  `grade_name` varchar(50) DEFAULT NULL,
  `info` varchar(500) DEFAULT NULL,
  `score` varchar(50) DEFAULT NULL,
  `department_id` varchar(30) DEFAULT NULL,
  `is_use` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`grade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

/*评分详情表*/
CREATE TABLE `tbl_erc_gradedetail` (
  `gradedetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `grade_id` bigint(20) DEFAULT NULL,
  `point` varchar(50) DEFAULT NULL,
  `advice` varchar(500) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`gradedetail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('内务管理','00','0',1,NOW(),NOW());
call Pro_AddMenu('内务管理', '5S管理','/erc/baseconfig/ERCGradeControl','ERCGRADECONTROL');
call Pro_AddMenu('内务管理', '5S评分统计','/erc/baseconfig/ERCGradeDetailControl','ERCGRADEDETAILCONTROL');

update tbl_common_api set api_path = '/erc/baseconfig/ERCArchivesListControl' where api_name = '档案信息查询';

alter table tbl_erc_archives add user_id varchar(50) after domain_id;
alter table tbl_erc_archives add keeper varchar(50);

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('劳动合同管理','00','0',1,NOW(),NOW());
call Pro_AddMenu('劳动合同管理', '劳动合同录入','/erc/baseconfig/ERCLaborContractControl','ERCLABORCONTRACTCONTROL');
call Pro_AddMenu('劳动合同管理', '劳动合同查询','/erc/baseconfig/ERCLaborContractListControl','ERCLABORCONTRACTLISTCONTROL');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(212 , '劳动合同提醒' , '分配劳动合同提醒人员', now(), now());

/*劳动合同表*/
CREATE TABLE `tbl_erc_laborcontract` (
  `laborcontract_id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `department_id` varchar(100) DEFAULT NULL,
  `laborcontract_state` int(11) DEFAULT NULL,
  `laborcontract_number` varchar(100) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `operator_id` varchar(100) DEFAULT NULL,
  `lendmoney_state` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`laborcontract_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('借款管理','00','0',1,NOW(),NOW());
call Pro_AddMenu('借款管理', '借款申报单','/erc/baseconfig/ERCLendMoneyControl','ERCLENDMONEYCONTROL');
call Pro_AddMenu('借款管理', '借款单确认','/erc/baseconfig/ERCLendMoneyConfirmControl','ERCLENDMONEYCONFIRMCONTROL');
call Pro_AddMenu('借款管理', '利息支付申请','/erc/baseconfig/ERCLendMoneyRepayControl','ERCLENDMONEYREPAYCONTROL');
call Pro_AddMenu('借款管理', '借款统计','/erc/baseconfig/ERCLendMoneyStatControl','ERCLENDMONEYSTATCONTROL');

CREATE TABLE `tbl_erc_lendmoney` (
  `lendmoney_id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `company_type` int(11) DEFAULT NULL,
  `company_id` varchar(100) DEFAULT NULL,
  `money` varchar(100) DEFAULT NULL,
  `expire_date` datetime DEFAULT NULL,
  `interest_date` datetime DEFAULT NULL,
  `operator_id` varchar(100) DEFAULT NULL,
  `cashier_id` varchar(100) DEFAULT NULL,
  `lendmoney_state` int(11) DEFAULT NULL,
  `lendmoney_number` varchar(100) DEFAULT NULL,
  `interest_rate` varchar(100) DEFAULT NULL,
  `arrive_date` datetime DEFAULT NULL,
  `arrive_money` varchar(100) DEFAULT NULL,
  `is_repay` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`lendmoney_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

CREATE TABLE `tbl_erc_lendmoneyrepayset` (
  `lendmoneyrepayset_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lendmoney_id` bigint(20) DEFAULT NULL,
  `repay_date` datetime DEFAULT NULL,
  `repay_money` varchar(100) DEFAULT NULL,
  `domain_id` int(11) DEFAULT NULL,
  `operator_id` varchar(100) DEFAULT NULL,
  `is_repay` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`lendmoneyrepayset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

CREATE TABLE `tbl_erc_lendmoneyrepay` (
  `lendmoneyrepay_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `operator_id` varchar(100) DEFAULT NULL,
  `lendmoney_id` int(11) DEFAULT NULL,
  `repay_money` varchar(100) DEFAULT NULL,
  `repay_interest` varchar(100) DEFAULT NULL,
  `lendmoneyrepay_state` int(11) DEFAULT NULL,
  `checker_id` varchar(100) DEFAULT NULL,
  `check_date` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`lendmoneyrepay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(214 , '利息支付申请确认' , '分配利息支付申请确认人员', now(), now());