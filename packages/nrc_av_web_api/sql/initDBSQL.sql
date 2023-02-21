CREATE SEQUENCE car_id_seq;
CREATE SEQUENCE sequence_id_seq;
CREATE SEQUENCE step_id_seq;

DROP TABLE IF EXISTS "public"."model";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS model_id_seq;

-- Table Definition
CREATE TABLE "public"."model" (
    "id" int4 NOT NULL DEFAULT nextval('model_id_seq'::regclass),
    "name" varchar NOT NULL,
    "year" int4 NOT NULL,
    "osType" varchar NOT NULL DEFAULT 'LINUX'::character varying,
    "osVersion" varchar NOT NULL,
    PRIMARY KEY ("id")
);  

INSERT INTO "public"."model" VALUES (1, 'model 1', 2023, 'LINUX', '0.1.0');

DROP TABLE IF EXISTS "public"."agent";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS agent_id_seq;

-- Table Definition
CREATE TABLE "public"."agent" (
    "id" int4 NOT NULL DEFAULT nextval('agent_id_seq'::regclass),
    "name" varchar NOT NULL,
    "repoUrl" varchar NOT NULL,
    "version" varchar NOT NULL,
    "status" varchar NOT NULL DEFAULT 'ACTIVE'::character varying,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."agent" VALUES (1, 'agent 1', 'sdfsfsd', '0.1.0', 'ACTIVE');

DROP TABLE IF EXISTS "public"."car";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS car_id_seq;

-- Table Definition
CREATE TABLE "public"."car" (
    "id" int4 NOT NULL DEFAULT nextval('car_id_seq'::regclass),
    "macAddress" varchar NOT NULL,
    "licenseNumber" varchar NOT NULL,
    "certKey" varchar NOT NULL,
    "connectionType" varchar NOT NULL DEFAULT 'WIFI'::character varying,
    "status" varchar NOT NULL DEFAULT 'WAITING'::character varying,
    "lastConnected" timestamp NOT NULL,
    "modelId" int4,
    "agentId" int4,
    CONSTRAINT "FK_c40870af5230c4d117729c8299f" FOREIGN KEY ("modelId") REFERENCES "public"."model"("id"),
    CONSTRAINT "FK_aaeb74b4c758920f378828464e9" FOREIGN KEY ("agentId") REFERENCES "public"."agent"("id"),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."car" ("id", "macAddress", "licenseNumber", "certKey", "connectionType", "status", "lastConnected", "modelId", "agentId") VALUES
(1, 'f4:26:79:be:3e:39', 'dfd62f72-ff6f-435c-89a1-03db9b2cdeed', 'dfd62f72-ff6f-435c-89a1-03db9b2cdeed', 'WIFI', 'ACTIVE', '2023-02-02 16:42:59', 1, 1);


-- ----------------------------
-- Primary Key structure for table car
-- ----------------------------

DROP TABLE IF EXISTS "public"."interface";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS interface_id_seq;

-- Table Definition
CREATE TABLE "public"."interface" (
    "id" int4 NOT NULL DEFAULT nextval('interface_id_seq'::regclass),
    "agentName" varchar NOT NULL,
    "modelId" int4,
    CONSTRAINT "FK_cf61908c55c5b599d145d2fcb76" FOREIGN KEY ("modelId") REFERENCES "public"."model"("id"),
    PRIMARY KEY ("id")
);



INSERT INTO "public"."interface" ("id", "agentName", "modelId") VALUES
(1, 'agent 1', 1);


DROP TABLE IF EXISTS "public"."cmd";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS cmd_id_seq;

-- Table Definition
CREATE TABLE "public"."cmd" (
    "id" int4 NOT NULL DEFAULT nextval('cmd_id_seq'::regclass),
    "name" varchar NOT NULL,
    "command" varchar NOT NULL,
    "nodes" varchar,
    "inclByDef" bool,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."cmd" VALUES 
(1, '1 sim1', 'roslaunch nrc_av_ui sim1.launch', null, false),
(2, '1 sim2', 'rosrun nrc_av_ui sim2', null, false);

DROP TABLE IF EXISTS "public"."cmdList";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."cmdList" (
    "interfaceId" int4 NOT NULL,
    "cmdId" int4 NOT NULL,
    CONSTRAINT "FK_44326420097a1842dae3dcb4994" FOREIGN KEY ("interfaceId") REFERENCES "public"."interface"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FK_ad3a6c0c123310bb521d5a892d3" FOREIGN KEY ("cmdId") REFERENCES "public"."cmd"("id"),
    PRIMARY KEY ("interfaceId","cmdId")
);

INSERT INTO "public"."cmdList" ("interfaceId", "cmdId") VALUES
(1, 1),
(1, 2),
(1, 3);


