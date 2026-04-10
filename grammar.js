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
  equality: 7,
  relational: 8,
  shift: 9,
  additive: 10,
  multiplicative: 11,
  exponent: 12,
  unary: 13,
  member: 14,
};

export default grammar({
  name: "mace",

  extras: ($) => [/\s/],

  word: ($) => $.identifier_word,

  reserved: {
    global: ($) => [
      "from",
      "import",
      "type",
      "enum",
      "schema",
      "doc",
      "array",
      "union",
      "variant",
      "string",
      "int",
      "float",
      "boolean",
      "output",
      "schema_file",
      "data",
      "injectable",
      "true",
      "false",
    ],
  },

  rules: {
    source_file: ($) =>
      seq(
        repeat(choice($.comment, $.import_declaration)),
        optional(seq($.script_block, repeat($.comment))),
        $.output_block,
        repeat($.comment),
      ),

    comment: (_) => token(choice(/\/=[^\r\n]*=\//, /\/=[^\r\n]*/)),

    identifier: ($) => reserved("global", $.identifier_word),

    identifier_word: (_) => /[A-Za-z][A-Za-z0-9_]*/,

    string_literal: ($) =>
      choice(
        seq(
          "'",
          repeat(choice(token.immediate(/[^'\\\r\n]+/), token.immediate(seq("\\", choice("\\", "'", '"', "n", "r", "t"))))),
          "'",
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
          '"',
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
    boolean_literal: (_) => choice("true", "false"),

    import_declaration: ($) =>
      seq(
        "from",
        $.string_literal,
        "import",
        $.identifier,
        repeat(seq(",", $.identifier)),
        ";",
      ),

    script_block: ($) =>
      seq($._script_delimiter, repeat(choice($.comment, $._declaration)), $._script_delimiter),

    _script_delimiter: (_) => token(prec(10, choice("|===|", "|====|", /\|={5,}\|/))),

    _declaration: ($) =>
      choice(
        $.variable_declaration,
        $.type_declaration,
        $.enum_declaration,
        $.schema_declaration,
      ),

    variable_declaration: ($) =>
      seq(
        optional($.injectable_modifier),
        $._type_reference,
        $.identifier,
        optional(seq("=", $._expression)),
        ";",
      ),

    injectable_modifier: (_) => "injectable",

    type_declaration: ($) => seq("type", $.identifier, ":", $._type_reference, ";"),

    enum_declaration: ($) =>
      seq(
        "enum",
        $.identifier,
        ":",
        $.enum_backing_type,
        "{",
        repeat(choice($.comment, seq($.enum_member, optional(",")))),
        "}",
        ";",
      ),

    enum_backing_type: ($) => choice($.string_type, $.int_type, $.float_type, $.boolean_type),

    enum_member: ($) => seq($.identifier, optional(seq("=", $.enum_member_value))),

    enum_member_value: ($) =>
      choice($.string_literal, $.int_literal, $.float_literal, $.boolean_literal),

    schema_declaration: ($) => seq("schema", $.identifier, ":", $.record_type, ";"),

    record_type: ($) =>
      seq(
        "{",
        optional($.schema_doc),
        repeat(choice($.comment, $.schema_field)),
        "}",
      ),

    schema_doc: ($) => seq("doc", $.doc_block_string),

    schema_field: ($) =>
      seq($.identifier, optional($.optional_marker), ":", $._type_reference, ";"),

    _type_reference: ($) =>
      choice(
        $.string_type,
        $.int_type,
        $.float_type,
        $.boolean_type,
        $.array_type,
        $.union_type,
        $.variant_type,
        $.named_type,
      ),

    string_type: (_) => "string",
    int_type: (_) => "int",
    float_type: (_) => "float",
    boolean_type: (_) => "boolean",

    array_type: ($) => seq("array", "<", $._type_reference, ">"),

    union_type: ($) =>
      prec(1, seq("union", "[", $._type_reference, repeat(seq(",", $._type_reference)), "]")),

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
          alias($._schema_directive_list, $.directive_list),
          "{",
          repeat(choice($.comment, $.output_schema_field)),
          "}",
        ),
      ),

    _data_directive_list: ($) =>
      prec(
        1,
        seq(
          "[",
          choice(
            $.schema_directive,
            $.schema_file_directive,
            seq(alias($.data_output_mode_directive, $.output_mode_directive)),

            seq(
              alias($.data_output_mode_directive, $.output_mode_directive),
              ",",
              $.schema_directive,
            ),

            seq(
              alias($.data_output_mode_directive, $.output_mode_directive),
              ",",
              $.schema_file_directive,
            ),
          ),
          "]",
        ),
      ),

    _schema_directive_list: ($) =>
      prec(2, seq("[", alias($.schema_output_mode_directive, $.output_mode_directive), "]")),

    data_output_mode_directive: ($) => seq("output", "=", $.data_mode),

    schema_output_mode_directive: ($) => seq("output", "=", $.schema_mode),

    data_mode: (_) => "data",
    schema_mode: (_) => "schema",

    schema_directive: ($) => seq("schema", "=", $.identifier),

    schema_file_directive: ($) => seq("schema_file", "=", $.string_literal),

    output_field: ($) =>
      seq($.identifier, optional($.optional_marker), ":", $._expression, ";"),

    output_schema_field: ($) =>
      seq($.identifier, optional($.optional_marker), ":", $._type_reference, ";"),

    optional_marker: (_) => "?",

    _expression: ($) =>
      choice(
        $.conditional_expression,
        $.logical_or_expression,
        $.logical_and_expression,
        $.bitwise_or_expression,
        $.bitwise_xor_expression,
        $.bitwise_and_expression,
        $.equality_expression,
        $.relational_expression,
        $.shift_expression,
        $.additive_expression,
        $.multiplicative_expression,
        $.exponent_expression,
        $.unary_expression,
        $._primary_expression,
      ),

    _primary_expression: ($) =>
      choice(
        $.enum_member_access,
        $.identifier,
        $.float_literal,
        $.int_literal,
        $.string_literal,
        $.boolean_literal,
        $.array_literal,
        $.record_literal,
        $.self_reference,
        $.parenthesized_expression,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    enum_member_access: ($) =>
      prec.left(
        PREC.member,
        seq(
          field("enum", choice($.identifier, $.parenthesized_expression, $.enum_member_access)),
          ".",
          field("member", $.identifier),
        ),
      ),

    self_reference: ($) => seq("$self", ".", $.identifier, repeat(seq(".", $.identifier))),

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
          ),
          $._expression,
        ),
      ),

    equality_expression: ($) =>
      prec.left(
        PREC.equality,
        seq(
          $._expression,
          choice(
            $.strict_equal_operator,
            $.strict_not_equal_operator,
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
      seq("[", optional(seq($._expression, repeat(seq(",", $._expression)))), "]"),

    record_literal: ($) => seq("{", repeat(choice($.comment, $.record_field)), "}"),

    record_field: ($) =>
      seq($.identifier, optional($.optional_marker), ":", $._expression, ";"),

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
    strict_equal_operator: (_) => "===",
    strict_not_equal_operator: (_) => "!==",
    and_and_operator: (_) => "&&",
    or_or_operator: (_) => "||",
  },
});
