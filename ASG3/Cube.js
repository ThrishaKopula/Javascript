class Cube{
    constructor() {
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.textureNum = -1;
    }
  
    render() {
      //var xy = this.position;
      var rgba = this.color;
      //var size = this.size;

      gl.uniform1i(u_whichTexture, this.textureNum);
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      //front - done
      drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
      drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

      //top
      drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
      drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

      //left - done
      drawTriangle3DUV([0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1]);
      drawTriangle3DUV([0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0]);

      //bottom
      drawTriangle3DUV([0,0,0, 0,0,1, 1,0,0], [0,0, 0,1, 1,0]);
      drawTriangle3DUV([1,0,0, 1,0,1, 0,0,1], [1,0, 1,1, 0,1]);

      //back
      drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
      drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);

      //right
      drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
      drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);
    }

    renderFast() {
      var rgba = this.color;
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      var allVerts = [];
      allVerts = allVerts.concat([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
      allVerts = allVerts.concat([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);

      allVerts = allVerts.concat([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
      allVerts = allVerts.concat([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,0]); //top

      allVerts = allVerts.concat([0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1]);
      allVerts = allVerts.concat([0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0]); //left

      allVerts = allVerts.concat([0,0,0, 0,0,1, 1,0,0], [0,1, 0,1, 1,1]);
      allVerts = allVerts.concat([1,0,0, 1,0,1, 0,0,1], [0,0, 1,1, 1,0]); //bottom

      allVerts = allVerts.concat([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,0]);
      allVerts = allVerts.concat([0,0,1, 1,0,1, 1,1,1], [1,0, 0,1, 0,0]); //back

      allVerts = allVerts.concat([1,0,0, 1,1,0, 1,1,1], [1,0, 1,1, 0,0]);
      allVerts = allVerts.concat([1,0,0, 1,0,1, 1,1,1], [1,0, 0,1, 0,0]); //right
      drawTriangle3DUV(allVerts);
    }
  }
  