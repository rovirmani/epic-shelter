from enum import Enum

class DatabaseType(str, Enum):
    POSTGRES = "postgres"
    MYSQL = "mysql"
    SNOWFLAKE = "snowflake"
    SINGLESTORE = "singlestore"
    SUPABASE = "supabase"
