from typing import Dict, Any, List, Optional
from datetime import datetime

class SchemaService:
    def translate_to_hydrolix_schema(
        self,
        source_schema: Dict[str, str],
        primary_key: Optional[List[str]] = None,
        partition_cols: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Translate source schema to Hydrolix schema format
        
        Args:
            source_schema: Source database schema (column name -> type)
            primary_key: List of primary key columns
            partition_cols: List of partition columns
        """
        # Map source types to Hydrolix types
        type_mapping = {
            'int': 'INT64',
            'bigint': 'INT64',
            'varchar': 'STRING',
            'text': 'STRING',
            'float': 'FLOAT64',
            'double': 'FLOAT64',
            'datetime': 'TIMESTAMP',
            'timestamp': 'TIMESTAMP',
            'date': 'DATE',
            'boolean': 'BOOL',
            'decimal': 'DECIMAL',
            'binary': 'BINARY',
            'json': 'STRING'
        }
        
        # Create columns list
        columns = []
        for col_name, col_type in source_schema.items():
            hydrolix_type = type_mapping.get(col_type.lower(), 'STRING')
            column = {
                "name": col_name,
                "type": hydrolix_type
            }
            
            # Mark as primary if in primary key list
            if primary_key and col_name in primary_key:
                column["primary"] = True
                
            columns.append(column)
        
        # Create schema with settings
        schema = {
            "columns": columns,
            "settings": {}
        }
        
        # Add primary key if specified
        if primary_key:
            schema["settings"]["primary_key"] = primary_key
            
        # Add partition columns if specified
        if partition_cols:
            schema["settings"]["partition_by"] = partition_cols
            
        return schema
