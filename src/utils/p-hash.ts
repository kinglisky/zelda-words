function memoizeCosines(N: number, cosMap: any) {
    cosMap = cosMap || {};
    cosMap[N] = new Array(N * N);

    let PI_N = Math.PI / N;

    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            cosMap[N][n + k * N] = Math.cos(PI_N * (n + 0.5) * k);
        }
    }
    return cosMap;
}

function dct(signal: number[], scale: number = 2) {
    let L = signal.length;
    let cosMap: any = null;

    if (!cosMap || !cosMap[L]) {
        cosMap = memoizeCosines(L, cosMap);
    }

    let coefficients = signal.map(function () {
        return 0;
    });

    return coefficients.map(function (_, ix) {
        return (
            scale *
            signal.reduce(function (prev, cur, index) {
                return prev + cur * cosMap[L][index + ix * L];
            }, 0)
        );
    });
}

// 一维数组升维
function createMatrix(arr: number[]) {
    const length = arr.length;
    const matrixWidth = Math.sqrt(length);
    const matrix = [];
    for (let i = 0; i < matrixWidth; i++) {
        const _temp = arr.slice(i * matrixWidth, i * matrixWidth + matrixWidth);
        matrix.push(_temp);
    }
    return matrix;
}

// 从矩阵中获取其“左上角”大小为 range × range 的内容
function getMatrixRange(matrix: number[][], range: number = 1) {
    const rangeMatrix = [];
    for (let i = 0; i < range; i++) {
        for (let j = 0; j < range; j++) {
            rangeMatrix.push(matrix[i][j]);
        }
    }
    return rangeMatrix;
}

export function getPHashFingerprint(imageData: ImageData) {
    const dctData = dct(imageData.data as any);
    const dctMatrix = createMatrix(dctData);
    const rangeMatrix = getMatrixRange(dctMatrix, dctMatrix.length / 8);
    const rangeAve =
        rangeMatrix.reduce((pre, cur) => pre + cur, 0) / rangeMatrix.length;
    return rangeMatrix.map((val) => (val >= rangeAve ? 1 : 0)).join('');
}
