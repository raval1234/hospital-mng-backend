import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import { s3, bucket, aws_url } from "../../bin/www";
import _ from "lodash";
import { getFileType } from "../helpers/utils";

const { v4: uuidv4 } = require("uuid");
var S3UploadService = {};

//upload file to AWS
S3UploadService.fileUpload = async (req, res, next) => {
  try {
    const contentType = req.headers["content-type"];
    if (
      contentType !== undefined &&
      contentType.indexOf("multipart/form-data") > -1
    ) {
      let filesData = req.files;
      if (!req.files || req.files.length === 0) return next();

      let attachs = [];
      for (const fileObj of filesData) {
        const file = fileObj;
        const filename = file.originalname;
        const extension =
          filename.lastIndexOf(".") === -1
            ? ""
            : filename.substring(
                filename.lastIndexOf(".") + 1,
                filename.length
              );
        const fileType = getFileType(file.mimetype);

        const size = file.size;
        let userId = "profile";
        if (req.user) userId = req.user._id;

        const fileLocationOnS3 = `upload_files/${userId}/upload_${uuidv4()}${
          extension ? "." + extension : ""
        }`;

        const params = {
          Bucket: bucket,
          Key: fileLocationOnS3,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        };

        let s3Response = await s3.upload(params).promise();

        const attach = {
          path: `${aws_url}/${s3Response.Key}`,
          filename: filename,
          type: fileType,
          s3Key: s3Response.key,
          s3FilePath: s3Response.Location,
          size: size,
        };
        attachs.push(attach);
      }
      req.body.files = attachs;
      return next();
    } else {
      return next();
    }
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true)
    );
  }
};

//delete file from AWS
S3UploadService.deleteFile = async (file) => {
  try {
    const key = file.substring(56);
    const params = { Bucket: bucket, Key: key };
    await s3.deleteObject(params).promise();
    return;
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true)
    );
  }
};

module.exports = S3UploadService;
