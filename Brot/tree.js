function Tree() {
    function TreeNode(elem, left, right, height = 0) {
        this.elem = elem;
        this.left = left;
        this.right = right;
        this.height = height;
    }

    this.root = null;

    this.__proto__.push = function (elem) {
        this.root = pushNode(elem, this.root);
    }

    this.__proto__.toArray = function () {
        return arr = toArray(0, this.root, []);
    }

    function toArray(i, node, arr) {
        if (node === null);
        else {
            arr[i] = node.elem;
            arr = toArray(i * 2 + 2, node.left, arr);
            arr = toArray(i * 2 + 1, node.right, arr);
        }
        return arr;
    }

    /*this.__proto__.toArray = function () {
        return toArray(this.root);
    }

    function toArray(node) {
        if (node === null) return [];
        else {
            let arr = [node.elem];
            let l = toArray(node.left);
            let r = toArray(node.right);
            for (let e of r) {
                arr.push(e);
            }
            for (let e of l) {
                arr.push(e);
            }
            return arr;
        }
    }*/

    function pushNode(elem, curr) {
        if (curr === null) {
            curr = new TreeNode(elem, null, null);
        } else if (elem < curr.elem) {
            curr.left = pushNode(elem, curr.left);
            if (height(curr.left) - height(curr.right) == 2) {
                if (elem < curr.left.elem) curr = rotLeft(curr);
                else curr = dobLeft(curr);
            }
        } else if (curr.elem < elem) {
            curr.right = pushNode(elem, curr.right);
            if (height(curr.right) - height(curr.left) == 2) {
                if (curr.right.elem < elem) curr = rotRight(curr);
                else curr = dobRight(curr);
            }
        }

        curr.height = max(height(curr.left), height(curr.right)) + 1;

        return curr;
    }

    function rotLeft(k2) {
        let k1 = k2.left;
        k2.left = k1.right;
        k1.right = k2;
        k2.height = max(height(k2.left), height(k2.right)) + 1;
        k1.height = max(height(k1.left), k2.height) + 1;
        return k1;
    }

    function rotRight(k2) {
        let k1 = k2.right;
        k2.right = k1.left;
        k1.left = k2;
        k2.height = max(height(k2.left), height(k2.right)) + 1;
        k1.height = max(height(k1.right), k2.height) + 1;
        return k1;
    }

    function dobLeft(k3) {
        k3.left = rotRight(k3.left);
        return rotLeft(k3);
    }

    function dobRight(k3) {
        k3.right = rotLeft(k3.right);
        return rotRight(k3);
    }

    function height(node) {
        return node === null ? -1 : node.height;
    }

    function max(a, b) {
        return a < b ? b : a;
    }
}
