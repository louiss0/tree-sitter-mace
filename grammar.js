/**
 * @file Tree-sitter grammar for the Mace language
 * @author
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  conditional: 1,
  logical_or: 2,
  logical_and: 3,
  bitwise_or: 4,
  bitwise_xor: 5,
  bitwise_and: 6,
  merge: 7,
  equality: 8,
  type_test: 9,
  relational: 10,
  shift: 11,
  additive: 12,
  multiplicative: 13,
  exponent: 14,
  unary: 15,
  member: 16,
};



export default grammar({
  name: "mace",

  extras: () => [/\s/],

  word: ($) => $.identifier_word,

  reserved: {
    global: () => [
      "from",
      "import",
      "type",
      "schema",
      "gen_doc",
      "schema_doc",
      "array",
      "fusion",
      "variant",
      "choice",
      "record",
      "string",
      "int",
      "float",
      "hex_int",
      "hex_float",
      "boolean",
      "nullable",
      "is",
      "null",
      "true",
      "false",
    ],
  },

  rules: {
    source_file: ($) =>
      seq(repeat($.comment), optional(seq($.script_block, repeat($.comment))), $.output_block, repeat($.comment)),

    comment: (_) => token(prec(1, choice(/\/\*[\s\S]*?\*\//, /\/\/[^\r\n]*/))),

    identifier: ($) => reserved("global", $.identifier_word),

    identifier_word: (_) => /[A-Za-z][A-Za-z0-9_]*/,

    string_literal: ($) =>
      choice(
        seq(
          "'",
          repeat(
            choice(
              token.immediate(/[^'\\\r\n]+/),
              token.immediate(seq("\\", choice("\\", "'", '"', "n", "r", "t"))),
            ),
          ),
          token.immediate("'"),
        ),
        seq(
          '"',
          repeat(
            choice(
              token.immediate(choice(/[^"\\\r\n$]+/, "$")),
              token.immediate(seq("\\", choice("\\", "'", '"', "n", "r", "t"))),
              $.interpolation,
            ),
          ),
          token.immediate('"'),
        ),
        seq(
          '"""',
          repeat(
            choice(
              token.immediate(choice(/[^"\\$]+/, '"', '""', "$")),
              token.immediate(seq("\\", choice("\\", "'", '"', "n", "r", "t"))),
              $.interpolation,
            ),
          ),
          '"""',
        ),
      ),

    doc_block_string: ($) =>
      seq(
        '"""',
        repeat(
          choice(
            token.immediate(choice(/[^"\\$]+/, '"', '""', "$")),
            token.immediate(seq("\\", choice("\\", "'", '"', "n", "r", "t"))),
          ),
        ),
        '"""',
      ),

    interpolation: ($) => seq("$(", $._expression, ")"),

    int_literal: (_) => /\d+/,
    float_literal: (_) => /\d+\.\d+/,
    hex_int_literal: (_) => /0[xX][0-9A-Fa-f]+/,
    hex_float_literal: (_) => /0[xX][0-9A-Fa-f]+\.[0-9A-Fa-f]+/,
    boolean_literal: (_) => choice("true", "false"),
    null_literal: (_) => "null",

    path_literal: (_) => /'[^'\\\r\n$]*'/,

    import_declaration: ($) =>
      seq(
        "from",
        $.path_literal,
        choice(
          seq("import", "-", "as", $.identifier),
          seq("import", $.identifier, repeat(seq(",", $.identifier))),
        ),
        ";",
      ),

    script_block: ($) =>
      seq(
        $._script_delimiter,
        repeat($.comment),
        repeat(seq($.import_declaration, repeat($.comment))),
        repeat(seq($._declaration, repeat($.comment))),
        $._script_delimiter,
      ),

    _script_delimiter: (_) => token(prec(100, seq("|", repeat1("="), "|"))),

    _declaration: ($) =>
      choice(
        $.variable_declaration,
        $.type_declaration,
        $.schema_declaration,
        $.gen_doc_declaration,
        $.schema_doc_declaration,
      ),

    variable_declaration: ($) =>
      seq(
        optional($.nullable_modifier),
        $._type_reference,
        $.identifier,
        "=",
        $._expression,
        optional($.inline_description),
        ";",
      ),

    type_declaration: ($) =>
      seq("type", $.identifier, ":", $._type_reference, optional($.inline_description), ";"),

    gen_doc_declaration: ($) =>
      seq("gen_doc", $.identifier, "{", repeat(choice($.comment, $.gen_doc_entry)), "}", optional(";")),

    schema_doc_declaration: ($) =>
      seq(
        "schema_doc",
        $.identifier,
        "{",
        repeat(choice($.comment, $.schema_doc_entry)),
        "}",
        optional(";"),
      ),

    gen_doc_entry: ($) => choice($.summary_entry, $.description_entry),

    schema_doc_entry: ($) => choice($.summary_entry, $.description_entry, $.fields_entry),

    summary_entry: ($) => seq("summary", ":", $.string_literal, $._pair_separator),

    description_entry: ($) => seq("description", ":", $.doc_block_string, $._pair_separator),

    fields_entry: ($) =>
      seq("fields", ":", "{", repeat(choice($.comment, $.field_doc_entry)), "}", $._pair_separator),

    field_doc_entry: ($) => seq($.field_name, ":", $.string_literal, $._pair_separator),

    schema_declaration: ($) => seq("schema", $.identifier, ":", $.record_type, optional(";")),

    record_type: ($) => seq("{", repeat(choice($.comment, $.schema_field)), "}"),

    field_name: ($) =>
      choice(
        $.identifier,
        "type",
        "schema",
        "output",
        "schema_file",
        "parse",
        "parse_file",
        "data",
        "from",
        "import",
        "record",
      ),
    _pair_separator: (_) => ",",
    _field_separator: (_) => ",",

    _field_suffix: ($) =>
      choice(
        seq($.inline_description, optional($._field_separator)),
        seq($._field_separator, optional($.inline_description)),
      ),

    schema_field: ($) =>
      seq(
        $.field_name,
        optional($.optional_marker),
        ":",
        $._type_reference,
        optional($._field_suffix),
      ),

    _type_reference: ($) =>
      choice(
        $.string_type,
        $.int_type,
        $.float_type,
        $.hex_int_type,
        $.hex_float_type,
        $.boolean_type,
        $.array_type,
        $.record_map_type,
        $.fusion_type,
        $.variant_type,
        $.choice_type,
        $.named_type,
      ),

    string_type: (_) => "string",
    int_type: (_) => "int",
    float_type: (_) => "float",
    hex_int_type: (_) => "hex_int",
    hex_float_type: (_) => "hex_float",
    boolean_type: (_) => "boolean",

    choice_type: ($) =>
      seq(
        "choice",
        "[",
        choice(
          $.choice_member,
          seq($.choice_member, repeat(seq(",", $.choice_member)))
        ),
        "]",
      ),

    choice_member: ($) =>
      choice(
        $.string_literal,
        $.int_literal,
        $.float_literal,
        $.hex_int_literal,
        $.hex_float_literal,
        $.boolean_literal,
        $.identifier,
      ),

    array_type: ($) => seq("array", "<", $._type_reference, ">"),

    record_map_type: ($) => seq("record", "<", $._type_reference, ">"),

    fusion_type: ($) =>
      prec(1, seq("fusion", "[", $._type_reference, repeat(seq(",", $._type_reference)), "]")),

    variant_type: ($) =>
      prec(1, seq("variant", "[", $._type_reference, repeat(seq(",", $._type_reference)), "]")),

    named_type: ($) => $.identifier,

    output_block: ($) =>
      choice(
        seq(
          optional(alias($._data_directive_list, $.directive_list)),
          "{",
          repeat(choice($.comment, $.output_field)),
          "}",
        ),
        seq(
          alias($._data_directive_list, $.directive_list),
          $.inline_doc_block,
          "{",
          repeat(choice($.comment, $.output_field)),
          "}",
        ),
        seq(
          alias($._schema_directive_list, $.directive_list),
          "{",
          repeat(choice($.comment, $.output_schema_field)),
          "}",
        ),
        seq(
          alias($._schema_directive_list, $.directive_list),
          $.inline_doc_block,
          "{",
          repeat(choice($.comment, $.output_schema_field)),
          "}",
        ),
      ),

    inline_doc_block: ($) => $.doc_block_string,

    _data_directive_list: ($) =>
      prec(
        1,
        seq(
          "[",
          choice(
            alias($.data_output_mode_directive, $.output_mode_directive),
            $.schema_directive,
            $.schema_file_directive,
            $.parse_directive,
            $.parse_file_directive,
          ),
          repeat(
            seq(
              ",",
              choice(
                alias($.data_output_mode_directive, $.output_mode_directive),
                $.schema_directive,
                $.schema_file_directive,
                $.parse_directive,
                $.parse_file_directive,
              ),
            ),
          ),
          "]",
        ),
      ),

    _schema_directive_list: ($) =>
      prec(2, seq("[", alias($.schema_output_mode_directive, $.output_mode_directive), "]")),

    data_output_mode_directive: (_) => seq("output", "=", "'data'"),

    schema_output_mode_directive: (_) => seq("output", "=", "'schema'"),

    schema_directive: ($) => seq("schema", "=", $.identifier),

    schema_file_directive: ($) => seq("schema_file", "=", $.path_literal),

    parse_directive: ($) => seq("parse", "=", $.identifier),

    parse_file_directive: ($) => seq("parse_file", "=", $.path_literal),

    output_field: ($) =>
      choice(
        seq(
          $.field_name,
          optional($.optional_marker),
          ":",
          $._expression,
          optional($._field_suffix),
        ),
        seq($.field_name, optional($._field_suffix)),
      ),

    output_schema_field: ($) =>
      seq(
        $.field_name,
        optional($.optional_marker),
        ":",
        $._type_reference,
        optional($._field_suffix),
      ),

    nullable_modifier: (_) => "nullable",

    inline_description: ($) => seq("/#", $.description_text),

    description_text: (_) => token(/[^,;\r\n]+/),

    optional_marker: (_) => "?",

    _expression: ($) =>
      choice(
        $.conditional_expression,
        $.logical_or_expression,
        $.logical_and_expression,
        $.bitwise_or_expression,
        $.bitwise_xor_expression,
        $.bitwise_and_expression,
        $.structural_merge,
        $.equality_expression,
        $.type_test_expression,
        $.relational_expression,
        $.shift_expression,
        $.additive_expression,
        $.multiplicative_expression,
        $.exponent_expression,
        $.unary_expression,
        $.member_access,
        $._primary_expression,
      ),

    _primary_expression: ($) =>
      choice(
        $.identifier,
        $.float_literal,
        $.int_literal,
        $.hex_float_literal,
        $.hex_int_literal,
        $.string_literal,
        $.boolean_literal,
        $.null_literal,
        $.array_literal,
        $.record_literal,
        $.self_reference,
        $.parsed_variable_reference,
        $.parenthesized_expression,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    member_access: ($) =>
      prec.left(
        PREC.member,
        seq(
          field("target", choice($._primary_expression, $.member_access)),
          field("operator", choice(".", "?.")),
          field("member", $.identifier),
        ),
      ),

    self_reference: ($) =>
      prec.left(PREC.member + 1, seq("$", "self", ".", $.identifier, repeat(seq(".", $.identifier)))),

    parsed_variable_reference: ($) =>
      prec.left(PREC.member + 1, seq("$", $.identifier)),

    unary_expression: ($) =>
      prec(
        PREC.unary,
        seq(
          choice($.bang_operator, $.tilde_operator, $.plus_operator, $.minus_operator),
          $._expression,
        ),
      ),

    exponent_expression: ($) =>
      prec.right(PREC.exponent, seq($._expression, $.double_star_operator, $._expression)),

    multiplicative_expression: ($) =>
      prec.left(
        PREC.multiplicative,
        seq(
          $._expression,
          choice($.star_operator, $.slash_operator, $.percent_operator),
          $._expression,
        ),
      ),

    additive_expression: ($) =>
      prec.left(
        PREC.additive,
        seq($._expression, choice($.plus_operator, $.minus_operator), $._expression),
      ),

    shift_expression: ($) =>
      prec.left(
        PREC.shift,
        seq(
          $._expression,
          choice(
            $.shift_left_operator,
            $.shift_right_operator,
            $.unsigned_shift_right_operator,
          ),
          $._expression,
        ),
      ),

    relational_expression: ($) =>
      prec.left(
        PREC.relational,
        seq(
          $._expression,
          choice(
            $.less_operator,
            $.less_equal_operator,
            $.greater_operator,
            $.greater_equal_operator,
            $.in_operator,
          ),
          $._expression,
        ),
      ),

    type_test_expression: ($) =>
      prec.left(
        PREC.type_test,
        seq(
          field("expression", $._expression),
          field("operator", $.is_operator),
          field("target_type", $._type_reference),
        ),
      ),

    merge_operand: ($) =>
      choice(
        $.identifier,
        $.array_literal,
        $.record_literal,
      ),

    structural_merge: ($) =>
      prec.left(
        PREC.merge,
        seq($.merge_operand, repeat1(seq("<>", $.merge_operand))),
      ),

    equality_expression: ($) =>
      prec.left(
        PREC.equality,
        seq(
          $._expression,
          choice(
            $.equal_equal_operator,
            $.not_equal_operator,
          ),
          $._expression,
        ),
      ),

    bitwise_and_expression: ($) =>
      prec.left(PREC.bitwise_and, seq($._expression, $.ampersand_operator, $._expression)),

    bitwise_xor_expression: ($) =>
      prec.left(PREC.bitwise_xor, seq($._expression, $.caret_operator, $._expression)),

    bitwise_or_expression: ($) =>
      prec.left(PREC.bitwise_or, seq($._expression, $.pipe_operator, $._expression)),

    logical_and_expression: ($) =>
      prec.left(PREC.logical_and, seq($._expression, $.and_and_operator, $._expression)),

    logical_or_expression: ($) =>
      prec.left(PREC.logical_or, seq($._expression, $.or_or_operator, $._expression)),

    conditional_expression: ($) =>
      prec.right(PREC.conditional, seq($._expression, "?", $._expression, ":", $._expression)),

    array_literal: ($) =>
      seq("[", optional(seq($._expression, repeat(seq(",", $._expression)), optional(","))), "]"),

    record_literal: ($) => seq("{", repeat(choice($.comment, $.record_field)), "}"),

    record_field: ($) =>
      choice(
        seq(
          $.field_name,
          optional($.optional_marker),
          ":",
          $._expression,
          optional(","),
        ),
        seq($.field_name, optional(",")),
      ),

    bang_operator: (_) => "!",
    tilde_operator: (_) => "~",
    plus_operator: (_) => "+",
    minus_operator: (_) => "-",
    star_operator: (_) => "*",
    slash_operator: (_) => "/",
    percent_operator: (_) => "%",
    double_star_operator: (_) => "**",
    shift_left_operator: (_) => "<<",
    shift_right_operator: (_) => ">>",
    unsigned_shift_right_operator: (_) => ">>>",
    ampersand_operator: (_) => "&",
    caret_operator: (_) => "^",
    pipe_operator: (_) => "|",
    less_operator: (_) => "<",
    less_equal_operator: (_) => "<=",
    greater_operator: (_) => ">",
    greater_equal_operator: (_) => ">=",
    equal_equal_operator: (_) => "==",
    not_equal_operator: (_) => "!=",
    and_and_operator: (_) => "&&",
    or_or_operator: (_) => "||",
    in_operator: (_) => "in",
    is_operator: (_) => "is",
  },
});
