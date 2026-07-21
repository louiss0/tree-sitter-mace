[
  "from"
  "import"
  "alias"
  "schema"
  "gen_doc"
  "schema_doc"
  "output"
  "schema_file"
  "parse"
  "parse_file"
  "match"
] @keyword

[
  (string_type)
  (int_type)
  (float_type)
  (hex_int_type)
  (hex_float_type)
  (boolean_type)
] @type.builtin

[
  "array"
  "fusion"
  "variant"
  "choice"
] @type.builtin

(type_declaration
  (identifier) @type.definition)

(schema_declaration
  (identifier) @type.definition)

(gen_doc_declaration
  "gen_doc" @keyword
  (identifier) @type.definition)

(schema_doc_declaration
  "schema_doc" @keyword
  (identifier) @type.definition)

[
  "summary"
  "description"
  "fields"
] @property

(import_declaration
  [
    "import"
    "bind"
  ] @keyword
  (identifier) @type)

(named_type
  (identifier) @type)

(schema_directive
  (identifier) @type)

(variable_declaration
  (_)
  (identifier) @variable)

(member_access
  target: (identifier) @variable
  member: (identifier) @property)

(member_access
  target: (parsed_variable_reference)
  member: (identifier) @property)

(member_access
  target: (member_access)
  member: (identifier) @property)

[
  (schema_field
    (field_name) @property)
  (output_field
    (field_name) @property)
  (output_schema_field
    (field_name) @property)
  (record_field
    (field_name) @property)
]

(field_doc_entry
  (field_name) @property)

(self_reference
  "$" @punctuation.special
  "self" @variable.language
  (identifier) @property)

(parsed_variable_reference
  "$" @punctuation.special
  (identifier) @variable)

[
  (string_literal)
  (doc_block_string)
  (inline_doc_block)
] @string

[
  (inline_description)
  (description_text)
] @comment

(inline_description
  "/#" @comment)
(interpolation
  "$(" @punctuation.special
  ")" @punctuation.special)

(int_literal) @number
(float_literal) @number.float
(hex_int_literal) @number
(hex_float_literal) @number.float
(boolean_literal) @boolean
(null_literal) @constant.builtin
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
  (and_and_operator)
  (or_or_operator)
  (optional_marker)
  "="
  "=>"
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
