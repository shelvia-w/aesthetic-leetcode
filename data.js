const problems = [
  {
    slug: "two-sum-ii",
    title: "Two Sum II",
    pattern: "Two Pointers",
    difficulty: "Easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "Find two numbers in a sorted array that add up to the target. Return their 1-indexed positions.",
    statement:
      "Given a 1-indexed sorted integer array, return the indices of two numbers whose sum equals the target. The answer is unique.",
    examples: [
      {
        input: "numbers = [2, 7, 11, 15], target = 9",
        output: "[1, 2]",
        explanation: "2 + 7 = 9, so the answer is [1, 2].",
      },
      {
        input: "numbers = [2, 3, 4], target = 6",
        output: "[1, 3]",
        explanation: "2 + 4 = 6.",
      },
      {
        input: "numbers = [-1, 0], target = -1",
        output: "[1, 2]",
        explanation: "-1 + 0 = -1.",
      },
    ],
    imagePath: "public/images/two-sum-ii.png",
    accent: "rose",
    categories: ["Arrays", "Two Pointers"],
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    pattern: "Two Pointers",
    difficulty: "Easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "Check whether a string reads the same forward and backward after cleaning it.",
    statement:
      "Return true if a string is a palindrome after converting uppercase letters to lowercase and removing non-alphanumeric characters.",
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" reads the same forward and backward.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: "true",
        explanation: "After removing non-alphanumeric characters, the string is empty.",
      },
    ],
    imagePath: "public/images/valid-palindrome.png",
    accent: "violet",
    categories: ["Strings", "Two Pointers"],
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    pattern: "Two Pointers",
    difficulty: "Easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "Reverse an array of characters in-place",
    statement:
      "Given a string, reverse its characters in-place using only constant extra space. ",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    imagePath: "public/images/reverse-string.png",
    accent: "violet",
    categories: ["Strings", "Two Pointers"],
  },
];

const filters = ["All", ...new Set(problems.flatMap((problem) => problem.categories))];

const concepts = [
  {
    slug: "two-pointers",
    title: "Two Pointers",
    summary: "Move paired indices through a sequence to shrink search space, compare ends, or converge on a target.",
    statement:
      "Two pointers uses two coordinated indices to scan a sequence from opposite ends, nearby positions, or different speeds.",
    focus: "Pattern",
    accent: "rose",
    imagePath: "public/images/two-pointers.png",
    tags: ["Arrays", "Strings", "Search"],
    method: [
      {
        title: "Define the pointer roles",
        body: "Start by naming the role of each index: left and right boundaries, read and write positions, or fast and slow runners.",
      },
      {
        title: "Keep the search valid",
        body: "After every move, the remaining search area should still contain every possible answer you have not ruled out.",
      },
      {
        title: "Move the pointer with a reason",
        body: "Advance the side that can no longer improve the result, satisfy the target, or keep the current window valid.",
      },
    ],
    sections: [
      {
        title: "When to use it",
        items: [
          {
            title: "Scan from both ends",
            description: "Compare boundaries and move inward when symmetry or end values decide the next step.",
            problems: [
              { title: "Valid Palindrome", slug: "valid-palindrome" },
              { title: "Reverse String", slug: "reverse-string"},
            ],
          },
          {
            title: "Find pairs in sorted input",
            description: "Use sorted order to adjust the sum by moving the lower or higher side.",
            problems: [
              { title: "Two Sum II", slug: "two-sum-ii" },
              { title: "3Sum" },
            ],
          },
          {
            title: "Shrink a search window",
            description: "Discard one edge at a time when it cannot lead to a stronger answer.",
            problems: [{ title: "Container With Most Water" }, { title: "Trapping Rain Water" }],
          },
          {
            title: "Track a flexible range",
            description: "Grow and contract a window while keeping a condition true.",
            problems: [{ title: "Minimum Size Subarray Sum" }, { title: "Longest Substring Without Repeating Characters" }],
          },
          {
            title: "Move or partition in-place",
            description: "Let one pointer scan while another writes, swaps, or marks a boundary.",
            problems: [
              { title: "Remove Duplicates from Sorted Array" },
              { title: "Move Zeroes" },
              { title: "Sort Colors" },
            ],
          },
          {
            title: "Compare two sequences",
            description: "Walk two inputs together when each side may advance at a different time.",
            problems: [{ title: "Merge Sorted Array" }, { title: "Is Subsequence" }],
          },
          {
            title: "Use different pointer speeds",
            description: "Run pointers at different rates to reveal cycles, midpoints, or gaps.",
            problems: [{ title: "Linked List Cycle" }, { title: "Middle of the Linked List" }],
          },
        ],
      },
    ],
  },
];

const conceptFilters = ["All", ...new Set(concepts.flatMap((concept) => concept.tags))];
