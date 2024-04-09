alter table "auth"."flow_state" add column "auth_code_issued_at" timestamp with time zone;

alter table "auth"."saml_providers" add column "name_id_format" text;


