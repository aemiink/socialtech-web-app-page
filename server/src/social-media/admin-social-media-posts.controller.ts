import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AttachSocialMediaPostAssetDto } from "./dto/attach-social-media-post-asset.dto";
import { UpdateSocialMediaPostDto } from "./dto/update-social-media-post.dto";
import { SocialMediaService } from "./social-media.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("social-media/posts")
export class AdminSocialMediaPostsController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get(":id")
  getPostById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) postId: string,
  ) {
    return this.socialMediaService.getPostById(currentUser, postId);
  }

  @Patch(":id")
  updatePost(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) postId: string,
    @Body() dto: UpdateSocialMediaPostDto,
  ) {
    return this.socialMediaService.updatePost(currentUser, postId, dto);
  }

  @Delete(":id")
  deletePost(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) postId: string,
  ) {
    return this.socialMediaService.deletePost(currentUser, postId);
  }

  @Post(":id/assets")
  attachPostAsset(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) postId: string,
    @Body() dto: AttachSocialMediaPostAssetDto,
  ) {
    return this.socialMediaService.attachPostAsset(currentUser, postId, dto);
  }

  @Delete(":id/assets/:assetId")
  deletePostAsset(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) postId: string,
    @Param("assetId", ParseUUIDPipe) assetId: string,
  ) {
    return this.socialMediaService.deletePostAsset(currentUser, postId, assetId);
  }
}
