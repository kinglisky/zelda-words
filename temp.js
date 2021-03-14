const hammingDistance = (hash1, hash2) => {
    let count = 0;
    hash1.forEach((it, index) => {
        count += it ^ hash2[index];
    });
    return count;
};