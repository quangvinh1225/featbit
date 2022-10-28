import {Component, Inject, LOCALE_ID} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISegment, ISegmentFlagReference } from '@features/safe/segments/types/segments-index';
import { SegmentService } from '@services/segment.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {hasLocalePath} from "@utils/index";

@Component({
  selector: 'segment-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.less']
})
export class SettingComponent {

  id: string;
  segmentDetail: ISegment = null;
  isLoading: boolean = true;
  flagReferences: ISegmentFlagReference[] = [];

  isEditingTitle = false;
  isEditingDescription = false;
  deleteModalVisible: boolean = false;

  constructor(
    @Inject(LOCALE_ID) public activeLocale: string,
    private route:ActivatedRoute,
    private msg: NzMessageService,
    private segmentService: SegmentService,
    private router: Router
  ) {
    this.route.paramMap.subscribe( paramMap => {
      this.id = decodeURIComponent(paramMap.get('id'));
      this.segmentService.getSegment(this.id).subscribe((result: ISegment) => {
        if (result) {
          this.id = result.id;
          this.loadSegment(result);
          this.segmentService.getFeatureFlagReferences(this.id).subscribe((flags: ISegmentFlagReference[]) => {
            this.flagReferences = [...flags];
          });
        }
      })
    })
  }

  private loadSegment(segment: ISegment) {
    this.segmentDetail = {...segment};
    this.segmentService.setCurrent(this.segmentDetail);
    this.isLoading = false;
  }

  save() {
    this.segmentService.update(this.segmentDetail).subscribe((result) => {
      this.segmentDetail = {...result};
      this.msg.success($localize `:@@common.operation-success:Operation succeeded`);
      this.segmentService.setCurrent({...result});
    }, errResponse => this.msg.error(errResponse.error));
  }

  saveTitle() {
    this.toggleTitleEditState();
    this.save();
  }

  saveDescription() {
    this.toggleDescriptionEditState();
    this.save();
  }

  toggleTitleEditState(): void {
    this.isEditingTitle = !this.isEditingTitle;
  }

  toggleDescriptionEditState(): void {
    this.isEditingDescription = !this.isEditingDescription;
  }

  openFlagPage(flagKey: string) {
    const path = hasLocalePath()? `/${this.activeLocale}/feature-flags/${flagKey}/targeting` : `/feature-flags/${flagKey}/targeting`;
    const url = this.router.serializeUrl(
      this.router.createUrlTree([path])
    );

    window.open(url, '_blank');
  }

  closeDeleteModal() {
    this.deleteModalVisible = false;
  }

  openDeleteModal() {
    this.deleteModalVisible = true;
  }

  deleting: boolean = false;
  delete() {
    this.deleting = true;
    this.segmentService.archive(this.segmentDetail.id).subscribe(() => {
      this.deleting = false;
      this.router.navigateByUrl(`/segments`);
    }, () => {
      this.deleting = false;
      this.msg.error($localize `:@@common.operation-failed:Operation failed`);
      this.closeDeleteModal();
    });
  }
}
