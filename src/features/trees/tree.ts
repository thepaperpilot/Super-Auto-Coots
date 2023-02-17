import type { CoercableComponent, OptionsFunc, Replace, StyleValue } from "features/feature";
import { Component, GatherProps, getUniqueID, setDefault, Visibility } from "features/feature";
import type { Link } from "features/links/links";
import type { GenericReset } from "features/reset";
import type { Resource } from "features/resources/resource";
import { displayResource } from "features/resources/resource";
import TreeComponent from "features/trees/Tree.vue";
import TreeNodeComponent from "features/trees/TreeNode.vue";
import type { DecimalSource } from "util/bignum";
import Decimal, { format, formatWhole } from "util/bignum";
import type {
    Computable,
    GetComputableType,
    GetComputableTypeWithDefault,
    ProcessedComputable
} from "util/computed";
import { convertComputable, processComputable } from "util/computed";
import { createLazyProxy } from "util/proxies";
import type { Ref } from "vue";
import { computed, ref, shallowRef, unref } from "vue";

export const TreeNodeType = Symbol("TreeNode");
export const TreeType = Symbol("Tree");

export interface TreeNodeOptions {
    visibility?: Computable<Visibility | boolean>;
    canClick?: Computable<boolean>;
    color?: Computable<string>;
    display?: Computable<CoercableComponent>;
    glowColor?: Computable<string>;
    classes?: Computable<Record<string, boolean>>;
    style?: Computable<StyleValue>;
    mark?: Computable<boolean | string>;
    reset?: GenericReset;
    onClick?: (e?: MouseEvent | TouchEvent) => void;
    onHold?: VoidFunction;
}

export interface BaseTreeNode {
    id: string;
    type: typeof TreeNodeType;
    [Component]: typeof TreeNodeComponent;
    [GatherProps]: () => Record<string, unknown>;
}

export type TreeNode<T extends TreeNodeOptions> = Replace<
    T & BaseTreeNode,
    {
        visibility: GetComputableTypeWithDefault<T["visibility"], Visibility.Visible>;
        canClick: GetComputableTypeWithDefault<T["canClick"], true>;
        color: GetComputableType<T["color"]>;
        display: GetComputableType<T["display"]>;
        glowColor: GetComputableType<T["glowColor"]>;
        classes: GetComputableType<T["classes"]>;
        style: GetComputableType<T["style"]>;
        mark: GetComputableType<T["mark"]>;
    }
>;

export type GenericTreeNode = Replace<
    TreeNode<TreeNodeOptions>,
    {
        visibility: ProcessedComputable<Visibility | boolean>;
        canClick: ProcessedComputable<boolean>;
    }
>;

export function createTreeNode<T extends TreeNodeOptions>(
    optionsFunc?: OptionsFunc<T, BaseTreeNode, GenericTreeNode>
): TreeNode<T> {
    return createLazyProxy(() => {
        const treeNode = optionsFunc?.() ?? ({} as ReturnType<NonNullable<typeof optionsFunc>>);
        treeNode.id = getUniqueID("treeNode-");
        treeNode.type = TreeNodeType;
        treeNode[Component] = TreeNodeComponent;

        processComputable(treeNode as T, "visibility");
        setDefault(treeNode, "visibility", Visibility.Visible);
        processComputable(treeNode as T, "canClick");
        setDefault(treeNode, "canClick", true);
        processComputable(treeNode as T, "color");
        processComputable(treeNode as T, "display");
        processComputable(treeNode as T, "glowColor");
        processComputable(treeNode as T, "classes");
        processComputable(treeNode as T, "style");
        processComputable(treeNode as T, "mark");

        if (treeNode.onClick) {
            const onClick = treeNode.onClick.bind(treeNode);
            treeNode.onClick = function (e) {
                if (unref(treeNode.canClick) !== false) {
                    onClick(e);
                }
            };
        }
        if (treeNode.onHold) {
            const onHold = treeNode.onHold.bind(treeNode);
            treeNode.onHold = function () {
                if (unref(treeNode.canClick) !== false) {
                    onHold();
                }
            };
        }

        treeNode[GatherProps] = function (this: GenericTreeNode) {
            const {
                display,
                visibility,
                style,
                classes,
                onClick,
                onHold,
                color,
                glowColor,
                canClick,
                mark,
                id
            } = this;
            return {
                display,
                visibility,
                style,
                classes,
                onClick,
                onHold,
                color,
                glowColor,
                canClick,
                mark,
                id
            };
        };

        return treeNode as unknown as TreeNode<T>;
    });
}

export interface TreeBranch extends Omit<Link, "startNode" | "endNode"> {
    startNode: GenericTreeNode;
    endNode: GenericTreeNode;
}

export interface TreeOptions {
    visibility?: Computable<Visibility | boolean>;
    nodes: Computable<GenericTreeNode[][]>;
    leftSideNodes?: Computable<GenericTreeNode[]>;
    rightSideNodes?: Computable<GenericTreeNode[]>;
    branches?: Computable<TreeBranch[]>;
    resetPropagation?: ResetPropagation;
    onReset?: (node: GenericTreeNode) => void;
}

export interface BaseTree {
    id: string;
    links: Ref<Link[]>;
    reset: (node: GenericTreeNode) => void;
    isResetting: Ref<boolean>;
    resettingNode: Ref<GenericTreeNode | null>;
    type: typeof TreeType;
    [Component]: typeof TreeComponent;
    [GatherProps]: () => Record<string, unknown>;
}

export type Tree<T extends TreeOptions> = Replace<
    T & BaseTree,
    {
        visibility: GetComputableTypeWithDefault<T["visibility"], Visibility.Visible>;
        nodes: GetComputableType<T["nodes"]>;
        leftSideNodes: GetComputableType<T["leftSideNodes"]>;
        rightSideNodes: GetComputableType<T["rightSideNodes"]>;
        branches: GetComputableType<T["branches"]>;
    }
>;

export type GenericTree = Replace<
    Tree<TreeOptions>,
    {
        visibility: ProcessedComputable<Visibility | boolean>;
    }
>;

export function createTree<T extends TreeOptions>(
    optionsFunc: OptionsFunc<T, BaseTree, GenericTree>
): Tree<T> {
    return createLazyProxy(() => {
        const tree = optionsFunc();
        tree.id = getUniqueID("tree-");
        tree.type = TreeType;
        tree[Component] = TreeComponent;

        tree.isResetting = ref(false);
        tree.resettingNode = shallowRef(null);

        tree.reset = function (node) {
            const genericTree = tree as GenericTree;
            genericTree.isResetting.value = true;
            genericTree.resettingNode.value = node;
            genericTree.resetPropagation?.(genericTree, node);
            genericTree.onReset?.(node);
            genericTree.isResetting.value = false;
            genericTree.resettingNode.value = null;
        };
        tree.links = computed(() => {
            const genericTree = tree as GenericTree;
            return unref(genericTree.branches) ?? [];
        });

        processComputable(tree as T, "visibility");
        setDefault(tree, "visibility", Visibility.Visible);
        processComputable(tree as T, "nodes");
        processComputable(tree as T, "leftSideNodes");
        processComputable(tree as T, "rightSideNodes");
        processComputable(tree as T, "branches");

        tree[GatherProps] = function (this: GenericTree) {
            const { nodes, leftSideNodes, rightSideNodes, branches } = this;
            return { nodes, leftSideNodes, rightSideNodes, branches };
        };

        return tree as unknown as Tree<T>;
    });
}

export type ResetPropagation = {
    (tree: GenericTree, resettingNode: GenericTreeNode): void;
};

export const defaultResetPropagation = function (
    tree: GenericTree,
    resettingNode: GenericTreeNode
): void {
    const nodes = unref(tree.nodes);
    const row = nodes.findIndex(nodes => nodes.includes(resettingNode)) - 1;
    for (let x = row; x >= 0; x--) {
        nodes[x].forEach(node => node.reset?.reset());
    }
};

export const invertedResetPropagation = function (
    tree: GenericTree,
    resettingNode: GenericTreeNode
): void {
    const nodes = unref(tree.nodes);
    const row = nodes.findIndex(nodes => nodes.includes(resettingNode)) + 1;
    for (let x = row; x < nodes.length; x++) {
        nodes[x].forEach(node => node.reset?.reset());
    }
};

export const branchedResetPropagation = function (
    tree: GenericTree,
    resettingNode: GenericTreeNode
): void {
    const visitedNodes = [resettingNode];
    let currentNodes = [resettingNode];
    if (tree.branches != null) {
        const branches = unref(tree.branches);
        while (currentNodes.length > 0) {
            const nextNodes: GenericTreeNode[] = [];
            currentNodes.forEach(node => {
                branches
                    .filter(branch => branch.startNode === node || branch.endNode === node)
                    .map(branch => {
                        if (branch.startNode === node) {
                            return branch.endNode;
                        }
                        return branch.startNode;
                    })
                    .filter(node => !visitedNodes.includes(node))
                    .forEach(node => {
                        // Check here instead of in the filter because this check's results may
                        // change as we go through each node
                        if (!nextNodes.includes(node)) {
                            nextNodes.push(node);
                            node.reset?.reset();
                        }
                    });
            });
            currentNodes = nextNodes;
            visitedNodes.push(...currentNodes);
        }
    }
};

export function createResourceTooltip(
    resource: Resource,
    requiredResource: Resource | null = null,
    requirement: Computable<DecimalSource> = 0
): Ref<string> {
    const req = convertComputable(requirement);
    return computed(() => {
        if (requiredResource == null || Decimal.gte(resource.value, unref(req))) {
            return displayResource(resource) + " " + resource.displayName;
        }
        return `Reach ${
            Decimal.eq(requiredResource.precision, 0)
                ? formatWhole(unref(req))
                : format(unref(req), requiredResource.precision)
        } ${requiredResource.displayName} to unlock (You have ${
            Decimal.eq(requiredResource.precision, 0)
                ? formatWhole(requiredResource.value)
                : format(requiredResource.value, requiredResource.precision)
        })`;
    });
}
