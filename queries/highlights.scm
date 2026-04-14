[
  "from"
  "import"
  "type"
  "schema"
  "doc"
  "enum"
  "output"
  "schema_file"
] @keyword

(injectable_modifier) @keyword.modifier

[
  (data_mode)
  (schema_mode)
] @keyword

[
  (string_type)
  (int_type)
  (float_type)
  (boolean_type)
] @type.builtin

[
  "array"
  "union"
  "variant"
] @type.builtin

(type_declaration
  (identifier) @type.definition)

(enum_declaration
  (identifier) @type.definition)

(schema_declaration
  (identifier) @type.definition)

(doc_declaration
  "doc" @keyword
  (identifier) @type.definition)

[
  "summary"
  "description"
  "props"
] @property

(enum_member
  (identifier) @constant)

(import_declaration
  (identifier) @type)

(named_type
  (identifier) @type)

(schema_directive
  (identifier) @type)

(variable_declaration
  (_)
  (identifier) @variable)

(variable_declaration
  (injectable_modifier)
  (_)
  (identifier) @variable)

(enum_member_access
  enum: (identifier) @variable
  member: (identifier) @property)

(enum_member_access
  enum: (enum_member_access)
  member: (identifier) @property)

[
  (schema_field)
  (output_field)
  (output_schema_field)
  (record_field)
] @property

(prop_entry
  (identifier) @property)

(self_reference
  (identifier) @property)

[
  (string_literal)
  (doc_block_string)
  (inline_doc_block)
] @string

[
  (inline_description)
  (description_text)
] @comment
(interpolation
  "$(" @punctuation.special
  ")" @punctuation.special)

(int_literal) @number
(float_literal) @number.float
(boolean_literal) @boolean
(comment) @comment

[
  (bang_operator)
  (tilde_operator)
  (plus_operator)
  (minus_operator)
  (star_operator)
  (slash_operator)
  (percent_operator)
  (double_star_operator)
  (shift_left_operator)
  (shift_right_operator)
  (unsigned_shift_right_operator)
  (ampersand_operator)
  (caret_operator)
  (pipe_operator)
  (less_operator)
  (less_equal_operator)
  (greater_operator)
  (greater_equal_operator)
  (equal_equal_operator)
  (not_equal_operator)
  (strict_equal_operator)
  (strict_not_equal_operator)
  (and_and_operator)
  (or_or_operator)
  (optional_marker)
  "="
  "?"
] @operator

[
  "."
  ","
  ":"
  ";"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket
