var buster = require("buster");
var assert = buster.assert;
var refute = buster.refute;
var createAtom = require("../atom").createAtom;

function concat(coll, i) {
    return coll.concat([i]);
}

buster.testCase("Atom", {
    "derefs value": function () {
        var val = {};
        var atom = createAtom(val);

        assert.same(atom.deref(), val);
    },

    "resets value": function () {
        var orig = {};
        var atom = createAtom(orig);
        var val = {};
        atom.reset(val);

        refute.same(atom.deref(), orig);
        assert.same(atom.deref(), val);
    },

    "swaps value": function () {
        var atom = createAtom([]);
        atom.swap(concat, 2);

        assert.equals(atom.deref(), [2]);
    },

    "reveals contents when stringified": function () {
        var atom = createAtom([2, 3, 4]);

        assert.equals(atom.toString(), "Atom([2,3,4])");
    },

    "validates state changes": function () {
        var atom = createAtom([], { validator: Array.isArray });

        assert.exception(function () { atom.reset({}); });
        assert.equals(atom.deref(), []);

        atom.reset([2]);
        assert.equals(atom.deref(), [2]);
    },

    "always passes validation without validator": function () {
        var atom = createAtom([]);

        refute.exception(function () { atom.reset(null); });
    },

    "notifies watchers": function () {
        var atom = createAtom([]);
        var george = this.spy();
        atom.addWatch("curious george", george);
        var gina = this.spy();
        atom.addWatch("curious gina", gina);

        atom.swap(concat, 2);
        atom.reset([1, 3]);

        assert.calledTwice(george);
        assert.calledTwice(gina);
        assert.calledWith(gina, "curious gina", atom, [], [2]);
        assert.calledWith(gina, "curious gina", atom, [2], [1, 3]);
    },

    "allows watchers to be removed during notifications": function () {
        var atom = createAtom([]);
        atom.addWatch("curious george", function () {
          atom.removeWatch("curious gina");
        });
        var gina = this.spy();
        atom.addWatch("curious gina", gina);

        atom.swap(concat, 1);

        refute.called(gina);
    }
});
