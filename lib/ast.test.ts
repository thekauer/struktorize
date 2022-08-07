import { down, up, left, right } from './ast';

describe("ast", () => {
    describe("down", () => {
        describe("statement/function", () => {


            it("should go down from signature to body", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["signature"];

                const actual = down(scope, ast);
                expect(actual.join(".")).toBe("body.0");

            });

            it("should go down twice", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        { type: "statement", path: "body.1", text: "a" },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(scope, ast), ast);
                const expexted = "body.2"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should not go down at after the last statement", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        { type: "statement", path: "body.1", text: "a" },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                    path: ""
                } as any;
                const scope = ["body", "2"];

                const actual = down(down(scope, ast), ast);
                const expexted = "body.2"
                expect(actual.join(".")).toBe(expexted);
            })
        })

        describe("loop", () => {
            it("should go down to loop condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "loop", path: "body.1", body: [
                                { type: "statement", path: "body.1.body.0", text: "a" }
                            ]
                        },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(scope, ast);
                const expexted = "body.1"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should go down into loop body", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "loop", path: "body.1", body: [
                                { type: "statement", path: "body.1.body.0", text: "a" }
                            ]
                        },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(scope, ast), ast);
                const expexted = "body.1.body.0"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should go down to the statement after the loop body", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "loop", path: "body.1", body: [
                                { type: "statement", path: "body.1.body.0", text: "a" }
                            ]
                        },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(down(scope, ast), ast), ast);
                const expexted = "body.2"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should not go down if loop is the last ast", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "loop", path: "body.1", body: [
                                { type: "statement", path: "body.1.body.0", text: "a" }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(down(scope, ast), ast), ast);
                const expexted = "body.1.body.0"
                expect(actual.join(".")).toBe(expexted);
            })

            it("when two loops are on top of each other it should go down from top loop's last ast to bottom loop's  condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", body: [

                                { type: "statement", path: "body.0.body.0", text: "a" },
                                { type: "statement", path: "body.0.body.1", text: "a" },
                                { type: "statement", path: "body.0.body.2", text: "a" },
                            ]
                        }, {
                            type: "loop", path: "body.1", body: [

                                { type: "statement", path: "body.1.body.0", text: "a" },
                                { type: "statement", path: "body.1.body.1", text: "a" },
                                { type: "statement", path: "body.1.body.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "body", "2"];

                const actual = down(scope, ast);
                expect(actual.join(".")).toBe("body.1");

            })
        })

        describe("branch", () => {
            it("should go down to if condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "branch", path: "body.1", ifBranch: [
                                { type: "statement", path: "body.1.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.1.elseBranch.0", text: "a" }
                            ]
                        },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(scope, ast);
                const expexted = "body.1"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should go down to the true branch", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "branch", path: "body.1", ifBranch: [
                                { type: "statement", path: "body.1.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.1.elseBranch.0", text: "a" }
                            ]
                        },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(scope, ast), ast);
                const expexted = "body.1.ifBranch.0"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should go down to the statement after the branch", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "branch", path: "body.1",
                            ifBranch: [
                                { type: "statement", path: "body.1.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.1.elseBranch.0", text: "a" }
                            ]
                        },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(down(scope, ast), ast), ast);
                const expexted = "body.2"
                expect(actual.join(".")).toBe(expexted);
            })

            it("should not go down if the branch is the last ast", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        {
                            type: "branch", path: "body.1", ifBranch: [
                                { type: "statement", path: "body.1.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.1.elseBranch.0", text: "a" }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = down(down(down(scope, ast), ast), ast);
                const expexted = "body.1.ifBranch.0"
                expect(actual.join(".")).toBe(expexted);
            })

            it("when two branches are on top of each other it should go down frop the top branch's true branch to the bottom branch's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", ifBranch: [
                                { type: "statement", path: "body.0.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.0.elseBranch.0", text: "a" }
                            ]
                        },
                        {
                            type: "branch", path: "body.1", ifBranch: [
                                { type: "statement", path: "body.1.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.1.elseBranch.0", text: "a" }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "ifBranch", "0"];

                const actual = down(scope, ast);
                const expexted = "body.1"
                expect(actual.join(".")).toBe(expexted);
            })


            it("when two branches are on top of each other it should go down frop the top branch's false branch to the bottom branch's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", ifBranch: [
                                { type: "statement", path: "body.0.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.0.elseBranch.0", text: "a" }
                            ]
                        },
                        {
                            type: "branch", path: "body.1", ifBranch: [
                                { type: "statement", path: "body.1.ifBranch.0", text: "a" }
                            ],
                            elseBranch: [
                                { type: "statement", path: "body.1.elseBranch.0", text: "a" }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "elseBranch", "0"];

                const actual = down(scope, ast);
                const expexted = "body.1"
                expect(actual.join(".")).toBe(expexted);
            })
        })
    })

    describe("up", () => {
        describe("statment/function", () => {
            it("should not go up from the signature", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["signature"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("signature");

            })

            it("should go up from the first statement to the signature", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("signature");

            })

            it("should go up twice from last statement to the first one", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                        { type: "statement", path: "body.1", text: "a" },
                        { type: "statement", path: "body.2", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "2"];

                const actual = up(up(scope, ast), ast);
                expect(actual.join(".")).toBe("body.0");

            })
        })

        describe("loop", () => {
            it("should go up from loop condition to signature when loop is the first ast", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", body: [

                                { type: "statement", path: "body.0.body.0", text: "a" },
                                { type: "statement", path: "body.0.body.1", text: "a" },
                                { type: "statement", path: "body.0.body.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("signature");

            })

            it("should go up from lopp body.0 to loop condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", body: [

                                { type: "statement", path: "body.0.body.0", text: "a" },
                                { type: "statement", path: "body.0.body.1", text: "a" },
                                { type: "statement", path: "body.0.body.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "body", "0"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("body.0");

            })

            it("should go up from last ast in loop body to the first one", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", body: [

                                { type: "statement", path: "body.0.body.0", text: "a" },
                                { type: "statement", path: "body.0.body.1", text: "a" },
                                { type: "statement", path: "body.0.body.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "body", "2"];

                const actual = up(up(scope, ast), ast);
                expect(actual.join(".")).toBe("body.0.body.0");
            })

            it("when two loops are on top of each other it should go up from bottom loop's condition to top loop's last ast", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", body: [

                                { type: "statement", path: "body.0.body.0", text: "a" },
                                { type: "statement", path: "body.0.body.1", text: "a" },
                                { type: "statement", path: "body.0.body.2", text: "a" },
                            ]
                        }, {
                            type: "loop", path: "body.1", body: [

                                { type: "statement", path: "body.1.body.0", text: "a" },
                                { type: "statement", path: "body.1.body.1", text: "a" },
                                { type: "statement", path: "body.1.body.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "1"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("body.0.body.2");

            })
        })

        describe("branch", () => {
            it("should go up from if's condition to function signature when if is the first ast", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0",
                            ifBranch: [

                                { type: "statement", path: "body.0.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.0.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("signature");

            })

            it("should go up from the first ast of the true branch of a branch to it's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0",
                            ifBranch: [

                                { type: "statement", path: "body.0.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.0.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "ifBranch", "0"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("body.0");

            })

            it("should go up from the first ast of the else branch of a branch to it's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0",
                            ifBranch: [

                                { type: "statement", path: "body.0.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.0.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "elseBranch", "0"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("body.0");

            })

            it("should go up from elseBranch's last ast to the first one", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0",
                            ifBranch: [

                                { type: "statement", path: "body.0.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.0.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "elseBranch", "2"];

                const actual = up(up(scope, ast), ast);
                expect(actual.join(".")).toBe("body.0.elseBranch.0");
            })

            it("should go up from ifBranch's last ast to the first one", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0",
                            ifBranch: [

                                { type: "statement", path: "body.0.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.0.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "ifBranch", "2"];

                const actual = up(up(scope, ast), ast);
                expect(actual.join(".")).toBe("body.0.ifBranch.0");
            })

            it("when two branches are on top if each other it should go up from the bottom branch's condition to the top branch's last ast in its true branch", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0",
                            ifBranch: [

                                { type: "statement", path: "body.0.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.0.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.0.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.0.elseBranch.2", text: "a" },
                            ]
                        },
                        {
                            type: "branch", path: "body.1",
                            ifBranch: [

                                { type: "statement", path: "body.1.ifBranch.0", text: "a" },
                                { type: "statement", path: "body.1.ifBranch.1", text: "a" },
                                { type: "statement", path: "body.1.ifBranch.2", text: "a" },
                            ],
                            elseBranch: [

                                { type: "statement", path: "body.1.elseBranch.0", text: "a" },
                                { type: "statement", path: "body.1.elseBranch.1", text: "a" },
                                { type: "statement", path: "body.1.elseBranch.2", text: "a" },
                            ]
                        }
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "1"];

                const actual = up(scope, ast);
                expect(actual.join(".")).toBe("body.0.ifBranch.2");
            })
        })
    })

    describe("left", () => {
        describe("statement/function", () => {
            it("should not go left from the signature", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["signature"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("signature");
            })

            it("should not go left from the first statement in the function", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

        })

        describe("loop", () => {
            it("should not go left from the first loop's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", text: "a",
                            body: [
                                { type: "branch", path: "body.0.body.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

            it("should go left from the loop's body to its condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", text: "a",
                            body: [
                                { type: "branch", path: "body.0.body.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "body", "0"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

        })

        describe("branch", () => {
            it("should not go left from the first branch's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.elseBranch.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

            it("should not go left from the first branch's true branch's asts ", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.elseBranch.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "ifBranch", "0"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0.ifBranch.0");
            })

            it("should go left from the first branch's false branch to its true branch ", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.elseBranch.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "elseBranch", "0"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0.ifBranch.0");
            })

            it("should go left from the false branch's last ast to its true branch's first ast when there is only one ast in the true branch ", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.elseBranch.0", text: "a", },
                                { type: "branch", path: "body.0.elseBranch.1", text: "a", },
                                { type: "branch", path: "body.0.elseBranch.2", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "elseBranch", "2"];

                const actual = left(scope, ast);
                expect(actual.join(".")).toBe("body.0.ifBranch.0");
            })
        })
    })

    describe("right", () => {
        describe("statement/function", () => {
            it("should not go right from the signature", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["signature"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("signature");
            })

            it("should not go right from the first statement in the function", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        { type: "statement", path: "body.0", text: "a" },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

        })

        describe("loop", () => {
            it("should not go right from the first loop's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", text: "a",
                            body: [
                                { type: "branch", path: "body.0.body.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

            it("should not go right from the loop's body", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "loop", path: "body.0", text: "a",
                            body: [
                                { type: "branch", path: "body.0.body.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "body", "0"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("body.0.body.0");
            })

        })

        describe("branch", () => {
            it("should not go right from the first branch's condition", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.elseBranch.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("body.0");
            })

            it("should not go right from the first branch's else branch's asts ", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.elseBranch.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "elseBranch", "0"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("body.0.elseBranch.0");
            })

            it("should go right from the first branch's true branch to its false branch ", () => {
                const ast = {
                    signature: { type: "signature", path: "signature", text: "none" },
                    body: [
                        {
                            type: "branch", path: "body.0", text: "a",
                            ifBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ],
                            elseBranch: [
                                { type: "branch", path: "body.0.ifBranch.0", text: "a", }
                            ]
                        },
                    ],
                    type: "function",
                } as any;
                const scope = ["body", "0", "ifBranch", "0"];

                const actual = right(scope, ast);
                expect(actual.join(".")).toBe("body.0.elseBranch.0");
            })
        })
    })


    describe("compound", () => { })
});
